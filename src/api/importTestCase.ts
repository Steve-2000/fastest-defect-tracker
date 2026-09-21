import * as XLSX from "xlsx";
import { addNewDefect } from "./defect/addNewDefect";
import { updateDefectById } from "./defect/updateDefect";
import { filterDefectByProject } from "./defect/filterDefectByProject";
import { createTestCase } from "./testCase/createTestcase";
import { updateTestCase } from "./testCase/updateTestCase";
import { getTestCasesByProject } from "./testCase/testCaseApi";
import { getModulesByProjectId } from "./module/getModule";
import { getSubmodulesByModuleId } from "./submodule/submoduleget";
import { getSeverities } from "./severity";
import { getAllPriorities } from "./priority";
import { getDefectTypes } from "./defectType";
import { getAllDefectStatuses } from "./defectStatus";
import { getDevelopersWithRolesByProjectId } from "./bench/projectAllocation";

export interface ImportTestCaseResponse {
  status: string;
  message: string;
  data: any;
  statusCode: number;
}

// Helper to extract File from FormData or File
const getFileFromInput = (input: any): File | null => {
  if (input instanceof File) return input;
  if (input && typeof input.get === "function") {
    const file = input.get("file") || input.get("excel");
    if (file instanceof File) return file;
  }
  return null;
};

// Helper to find a value in a row ignoring casing, spaces, and punctuation
const findVal = (row: Record<string, any>, keys: string[]): string => {
  for (const k of keys) {
    const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const rowKey of Object.keys(row)) {
      if (rowKey.toLowerCase().replace(/[^a-z0-9]/g, "") === cleanK) {
        return String(row[rowKey] ?? "").trim();
      }
    }
  }
  return "";
};

const normalizeStr = (s: any) => String(s ?? "").trim().replace(/\r\n/g, "\n");

export const importDefects = async (
  fileOrFormData: FormData | File | any,
  projectId: string | number
): Promise<{ status: string; statusCode: number; message: string; data: any }> => {
  const file = getFileFromInput(fileOrFormData);
  if (!file) {
    throw new Error("No file provided for defect import.");
  }

  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) {
    throw new Error("The uploaded file does not contain any sheets.");
  }

  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });

  if (!rows || rows.length === 0) {
    return {
      status: "success",
      statusCode: 200,
      message: "No data rows found in the sheet.",
      data: { imported: 0, failed: 0, total: 0, skipped: 0 },
    };
  }

  // Fetch project metadata and existing defects in parallel
  const [
    modulesRes,
    severitiesRes,
    prioritiesRes,
    defectTypesRes,
    statusesRes,
    developersRes,
    existingDefectsRes,
  ] = await Promise.all([
    getModulesByProjectId(Number(projectId)).catch(() => ({ data: [] })),
    getSeverities().catch(() => ({ data: [] })),
    getAllPriorities().catch(() => ({ data: [] })),
    getDefectTypes().catch(() => ({ data: [] })),
    getAllDefectStatuses().catch(() => ({ data: [] })),
    getDevelopersWithRolesByProjectId(Number(projectId)).catch(() => []),
    filterDefectByProject(Number(projectId)).catch(() => []),
  ]);

  const modulesList: any[] = Array.isArray(modulesRes)
    ? modulesRes
    : Array.isArray(modulesRes?.data)
    ? modulesRes.data
    : Array.isArray(modulesRes?.data?.data)
    ? modulesRes.data.data
    : [];

  const severitiesList: any[] = Array.isArray(severitiesRes)
    ? severitiesRes
    : Array.isArray(severitiesRes?.data)
    ? severitiesRes.data
    : [];

  const prioritiesList: any[] = Array.isArray(prioritiesRes)
    ? prioritiesRes
    : Array.isArray(prioritiesRes?.data)
    ? prioritiesRes.data
    : [];

  const defectTypesList: any[] = Array.isArray(defectTypesRes)
    ? defectTypesRes
    : Array.isArray(defectTypesRes?.data)
    ? defectTypesRes.data
    : [];

  const statusesList: any[] = Array.isArray(statusesRes)
    ? statusesRes
    : Array.isArray(statusesRes?.data)
    ? statusesRes.data
    : [];

  const developersList: any[] = Array.isArray(developersRes)
    ? developersRes
    : Array.isArray(developersRes?.data)
    ? developersRes.data
    : [];

  const existingDefects: any[] = Array.isArray(existingDefectsRes)
    ? existingDefectsRes
    : Array.isArray(existingDefectsRes?.data)
    ? existingDefectsRes.data
    : [];

  // Fetch submodules for all project modules
  const submodulesMap: Record<number, any[]> = {};
  await Promise.all(
    modulesList.map(async (m: any) => {
      try {
        const subRes: any = await getSubmodulesByModuleId(Number(m.id));
        const list = Array.isArray(subRes)
          ? subRes
          : Array.isArray(subRes?.data)
          ? subRes.data
          : Array.isArray(subRes?.data?.data)
          ? subRes.data.data
          : [];
        submodulesMap[Number(m.id)] = list;
      } catch {
        submodulesMap[Number(m.id)] = [];
      }
    })
  );

  let importedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    const defectNo = findVal(row, ["defectid", "defectno", "id"]);
    const title = findVal(row, [
      "title",
      "titledescription",
      "title / description",
      "title/description",
      "defecttitle",
      "name",
      "briefdescription",
      "brief description",
    ]);
    const description = findVal(row, [
      "description",
      "titledescription",
      "title / description",
      "title/description",
      "defectdescription",
      "summary",
      "details",
      "briefdescription",
      "brief description",
    ]);
    const steps = findVal(row, [
      "stepstorecreation",
      "stepstorecreate",
      "steps",
      "recreationsteps",
    ]);
    const severityName = findVal(row, ["severity", "severityname"]);
    const priorityName = findVal(row, ["priority", "priorityname"]);
    const typeName = findVal(row, ["defecttype", "type", "typename"]);
    const statusName = findVal(row, ["status", "defectstatus", "statusname"]);
    const moduleName = findVal(row, ["module", "modulename"]);
    const subModuleName = findVal(row, ["submodule", "submodulename"]);
    const assignedToName = findVal(row, ["assignedto", "assignto", "assignee", "developer"]);

    // Check against existing defects
    let matchedExisting: any = null;
    if (defectNo) {
      matchedExisting = existingDefects.find((d: any) => {
        const dNo = String(d.defectNo || d.defect_id || d.defectId || "").toLowerCase().trim();
        const dId = String(d.id || "").toLowerCase().trim();
        const dProjNum = d.projectDefectNumber ? String(d.projectDefectNumber) : "";
        const target = defectNo.toLowerCase().trim();
        return (
          dNo === target ||
          dId === target ||
          `def-${dId}` === target ||
          (dProjNum && (`def-${dProjNum}` === target || dProjNum === target))
        );
      });
    }

    const finalDescription =
      description ||
      title ||
      matchedExisting?.description ||
      matchedExisting?.title ||
      `Defect ${defectNo || rowNum}`;

    const finalTitle =
      title ||
      description ||
      matchedExisting?.title ||
      matchedExisting?.description ||
      (finalDescription.length > 60
        ? finalDescription.substring(0, 57) + "..."
        : finalDescription);

    if (!matchedExisting) {
      // Check if an existing defect already has the exact same brief description and steps
      const exactDuplicate = existingDefects.find((d: any) => {
        const dDesc = normalizeStr(d.description || d.title);
        const dSteps = normalizeStr(d.stepsToRecreation || d.steps);
        return (
          dDesc.toLowerCase() === normalizeStr(finalDescription).toLowerCase() &&
          dSteps.toLowerCase() === normalizeStr(steps).toLowerCase()
        );
      });

      if (exactDuplicate) {
        // Neither brief description nor steps changed: SKIP!
        skippedCount++;
        continue;
      }
    } else {
      // Defect already exists: check if brief description or steps is changed
      const existingDesc = normalizeStr(matchedExisting.description || matchedExisting.title);
      const existingTitle = normalizeStr(matchedExisting.title || "");
      const existingSteps = normalizeStr(
        matchedExisting.stepsToRecreation || matchedExisting.steps
      );

      const newDesc = normalizeStr(finalDescription);
      const newTitle = normalizeStr(finalTitle);
      const newSteps = normalizeStr(steps);

      const isDescChanged =
        (newDesc.toLowerCase() !== existingDesc.toLowerCase() && newDesc.toLowerCase() !== existingTitle.toLowerCase()) ||
        (newTitle.toLowerCase() !== existingTitle.toLowerCase() && newTitle.toLowerCase() !== existingDesc.toLowerCase());
      const isStepsChanged = newSteps.toLowerCase() !== existingSteps.toLowerCase();

      if (!isDescChanged && !isStepsChanged) {
        // Neither brief description nor steps is changed: SKIP AS DUPLICATE!
        skippedCount++;
        continue;
      }
    }

    // Match module
    let matchedModule = modulesList.find(
      (m: any) =>
        m.name?.toLowerCase().trim() === moduleName.toLowerCase().trim() ||
        String(m.id) === moduleName
    );
    if (!matchedModule && modulesList.length > 0) {
      matchedModule = modulesList[0];
    }

    // Match submodule
    let matchedSubModule: any = null;
    if (matchedModule) {
      const subs = submodulesMap[Number(matchedModule.id)] || [];
      matchedSubModule = subs.find(
        (sm: any) =>
          sm.name?.toLowerCase().trim() === subModuleName.toLowerCase().trim() ||
          String(sm.id) === subModuleName
      );
      if (!matchedSubModule && subs.length > 0) {
        matchedSubModule = subs[0];
      }
    }

    // Match severity
    const matchedSeverity = severitiesList.find(
      (s: any) =>
        s.name?.toLowerCase().trim() === severityName.toLowerCase().trim() ||
        String(s.id) === severityName
    ) || severitiesList[0];

    // Match priority
    const matchedPriority = prioritiesList.find(
      (p: any) =>
        p.name?.toLowerCase().trim() === priorityName.toLowerCase().trim() ||
        String(p.id) === priorityName
    ) || prioritiesList[0];

    // Match defect type
    let matchedDefectType: any = null;
    if (typeName) {
      matchedDefectType = defectTypesList.find(
        (dt: any) =>
          (dt.name || dt.defectTypeName)?.toLowerCase().trim() === typeName.toLowerCase().trim() ||
          String(dt.id) === typeName
      );
    }

    let typeToSend: string;
    let defectTypeIdToSend: number | null = null;
    if (matchedDefectType) {
      typeToSend = matchedDefectType.name || typeName;
      defectTypeIdToSend = Number(matchedDefectType.id);
    } else if (typeName) {
      // Use the exact type string from the imported row
      typeToSend = typeName;
      defectTypeIdToSend = null;
    } else if (matchedExisting?.type || matchedExisting?.defectTypeName) {
      typeToSend = matchedExisting.type || matchedExisting.defectTypeName;
      defectTypeIdToSend = matchedExisting.defectTypeId ? Number(matchedExisting.defectTypeId) : null;
    } else {
      typeToSend = defectTypesList[0]?.name || "Bug";
      defectTypeIdToSend = defectTypesList[0]?.id ? Number(defectTypesList[0].id) : null;
    }

    // Match status
    const matchedStatus = statusesList.find(
      (st: any) =>
        (st.statusName || st.name)?.toLowerCase().trim() === statusName.toLowerCase().trim()
    );
    const finalStatus = matchedStatus
      ? (matchedStatus.statusName || matchedStatus.name)
      : (statusName || "New");

    // Match developer
    let matchedDevId: number | null = null;
    if (assignedToName) {
      const dev = developersList.find((d: any) => {
        const fullName = `${d.firstName || ""} ${d.lastName || ""}`.trim().toLowerCase();
        const userName = (d.userName || d.name || "").toLowerCase();
        const email = (d.email || "").toLowerCase();
        const search = assignedToName.toLowerCase().trim();
        return (
          fullName === search ||
          userName === search ||
          email === search ||
          String(d.id || d.employeeId) === search
        );
      });
      if (dev) {
        matchedDevId = Number(dev.employeeId || dev.userId || dev.id);
      }
    }

    const payload = {
      projectId: Number(projectId),
      defectNo: defectNo || undefined,
      title: finalTitle,
      description: finalDescription,
      stepsToRecreation: steps,
      expectedResult: "",
      actualResult: "",
      severityId: matchedSeverity?.id ? Number(matchedSeverity.id) : null,
      priorityId: matchedPriority?.id ? Number(matchedPriority.id) : null,
      type: typeToSend,
      defectTypeId: defectTypeIdToSend,
      moduleId: matchedModule?.id ? Number(matchedModule.id) : null,
      subModuleId: matchedSubModule?.id ? Number(matchedSubModule.id) : null,
      assignedTo: matchedDevId,
      status: finalStatus,
      isAddTestCase: false,
    };

    try {
      const form = new FormData();
      form.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      form.append("attachmentFile", new Blob([], { type: "application/octet-stream" }));

      let res: any;
      if (matchedExisting?.id) {
        // Update existing defect because brief description or steps changed
        res = await updateDefectById(Number(matchedExisting.id), form as any);
      } else {
        // Create new defect
        res = await addNewDefect(form as any);
      }

      if (
        res?.status?.toLowerCase() === "created" ||
        res?.status?.toLowerCase() === "success" ||
        res?.statusCode === 201 ||
        res?.statusCode === 200 ||
        res?.statusCode === 2000
      ) {
        importedCount++;
      } else {
        failedCount++;
        errors.push(`Row ${rowNum}: ${res?.message || "Failed to import defect"}`);
      }
    } catch (err: any) {
      failedCount++;
      errors.push(`Row ${rowNum}: ${err?.response?.data?.message || err.message || "Error"}`);
    }
  }

  const successMessage =
    importedCount > 0
      ? `Import completed: ${importedCount} defects imported/updated${
          skippedCount > 0 ? `, ${skippedCount} duplicate defects skipped.` : "."
        }`
      : `Duplicate: All ${skippedCount} defect(s) already exist with no changes. Nothing was imported.`;

  return {
    status: importedCount > 0 || skippedCount > 0 ? "success" : "failure",
    statusCode: importedCount > 0 || skippedCount > 0 ? 200 : 400,
    message: successMessage,
    data: {
      imported: importedCount,
      successCount: importedCount,
      skipped: skippedCount,
      skippedCount,
      skipReasons: `All ${skippedCount} defect(s) are duplicates with unchanged description and steps`,
      failed: failedCount,
      failedCount,
      total: rows.length,
      totalCount: rows.length,
      errors,
    },
  };
};

export const importTestCases = async (
  fileOrFormData: FormData | File | any,
  projectId: string | number
): Promise<ImportTestCaseResponse> => {
  const file = getFileFromInput(fileOrFormData);
  if (!file) {
    throw new Error("No file provided for test case import.");
  }

  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) {
    throw new Error("The uploaded file does not contain any sheets.");
  }

  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });

  if (!rows || rows.length === 0) {
    return {
      status: "success",
      statusCode: 200,
      message: "No data rows found in the sheet.",
      data: { importedCount: 0, failedCount: 0, skippedCount: 0, total: 0 },
    };
  }

  // Fetch project modules, severities, defect types, and existing test cases in parallel
  const [modulesRes, severitiesRes, defectTypesRes, existingTestCasesRes] =
    await Promise.all([
      getModulesByProjectId(Number(projectId)).catch(() => ({ data: [] })),
      getSeverities().catch(() => ({ data: [] })),
      getDefectTypes().catch(() => ({ data: [] })),
      getTestCasesByProject(Number(projectId)).catch(() => []),
    ]);

  const modulesList: any[] = Array.isArray(modulesRes)
    ? modulesRes
    : Array.isArray(modulesRes?.data)
    ? modulesRes.data
    : Array.isArray(modulesRes?.data?.data)
    ? modulesRes.data.data
    : [];

  const severitiesList: any[] = Array.isArray(severitiesRes)
    ? severitiesRes
    : Array.isArray(severitiesRes?.data)
    ? severitiesRes.data
    : [];

  const defectTypesList: any[] = Array.isArray(defectTypesRes)
    ? defectTypesRes
    : Array.isArray(defectTypesRes?.data)
    ? defectTypesRes.data
    : [];

  const existingTestCases: any[] = Array.isArray(existingTestCasesRes)
    ? existingTestCasesRes
    : Array.isArray(existingTestCasesRes?.data)
    ? existingTestCasesRes.data
    : [];

  // Fetch submodules for all project modules
  const submodulesMap: Record<number, any[]> = {};
  await Promise.all(
    modulesList.map(async (m: any) => {
      try {
        const subRes: any = await getSubmodulesByModuleId(Number(m.id));
        const list = Array.isArray(subRes)
          ? subRes
          : Array.isArray(subRes?.data)
          ? subRes.data
          : Array.isArray(subRes?.data?.data)
          ? subRes.data.data
          : [];
        submodulesMap[Number(m.id)] = list;
      } catch {
        submodulesMap[Number(m.id)] = [];
      }
    })
  );

  let importedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    const testCaseNo = findVal(row, ["testcaseno", "testcaseid", "no", "id"]);
    const name = findVal(row, ["name", "title", "testcasename", "briefdescription"]);
    const description = findVal(row, [
      "description",
      "testcasedescription",
      "summary",
      "briefdescription",
    ]);
    const steps = findVal(row, ["steps", "detailssteps", "teststeps"]);
    const moduleName = findVal(row, ["module", "modulename"]);
    const subModuleName = findVal(row, ["submodule", "submodulename"]);
    const severityName = findVal(row, ["severity", "severityname"]);
    const typeName = findVal(row, ["defecttype", "type", "testcasetype"]);

    const finalDescription = description || name || `Test Case ${testCaseNo || rowNum}`;
    const finalName =
      name ||
      (finalDescription.length > 60
        ? finalDescription.substring(0, 57) + "..."
        : finalDescription);

    // Check against existing test cases
    let matchedExisting: any = null;
    if (testCaseNo) {
      matchedExisting = existingTestCases.find((tc: any) => {
        const tcNo = String(tc.no || tc.testCaseId || tc.testcaseNo || "").toLowerCase().trim();
        const tcId = String(tc.id || "").toLowerCase().trim();
        const target = testCaseNo.toLowerCase().trim();
        return tcNo === target || tcId === target || `tc-${tcId}` === target;
      });
    }

    if (!matchedExisting) {
      // Check if an existing test case already has the exact same description and steps
      const exactDuplicate = existingTestCases.find((tc: any) => {
        const tcDesc = normalizeStr(tc.description || tc.name);
        const tcSteps = normalizeStr(tc.detailsSteps || tc.steps);
        return (
          tcDesc.toLowerCase() === normalizeStr(finalDescription).toLowerCase() &&
          tcSteps.toLowerCase() === normalizeStr(steps).toLowerCase()
        );
      });

      if (exactDuplicate) {
        // Neither description nor steps changed: SKIP!
        skippedCount++;
        continue;
      }
    } else {
      // Test case already exists: check if description/name or steps changed
      const existingDesc = normalizeStr(matchedExisting.description || matchedExisting.name);
      const existingName = normalizeStr(matchedExisting.name || "");
      const existingSteps = normalizeStr(
        matchedExisting.detailsSteps || matchedExisting.steps
      );

      const newDesc = normalizeStr(finalDescription);
      const newName = normalizeStr(finalName);
      const newSteps = normalizeStr(steps);

      const isDescChanged =
        (newDesc !== existingDesc && newDesc !== existingName) ||
        (newName !== existingName && newName !== existingDesc);
      const isStepsChanged = newSteps !== existingSteps;

      if (!isDescChanged && !isStepsChanged) {
        // Neither brief description nor steps changed: ONLY IMPORT IF CHANGED, OTHERWISE NO!
        skippedCount++;
        continue;
      }
    }

    // Match module
    let matchedModule = modulesList.find(
      (m: any) =>
        m.name?.toLowerCase().trim() === moduleName.toLowerCase().trim() ||
        String(m.id) === moduleName
    );
    if (!matchedModule && modulesList.length > 0) {
      matchedModule = modulesList[0];
    }

    // Match submodule
    let matchedSubModule: any = null;
    if (matchedModule) {
      const subs = submodulesMap[Number(matchedModule.id)] || [];
      matchedSubModule = subs.find(
        (sm: any) =>
          sm.name?.toLowerCase().trim() === subModuleName.toLowerCase().trim() ||
          String(sm.id) === subModuleName
      );
      if (!matchedSubModule && subs.length > 0) {
        matchedSubModule = subs[0];
      }
    }

    // If still no submodule, search across all project submodules
    if (!matchedSubModule) {
      for (const modId of Object.keys(submodulesMap)) {
        const subs = submodulesMap[Number(modId)] || [];
        if (subs.length > 0) {
          matchedSubModule = subs[0];
          break;
        }
      }
    }

    const subModuleIdToUse = matchedSubModule?.id || matchedExisting?.subModuleId;
    if (!subModuleIdToUse) {
      failedCount++;
      errors.push(`Row ${rowNum}: No valid submodule found in project for test case.`);
      continue;
    }

    // Match severity
    const matchedSeverity = severitiesList.find(
      (s: any) =>
        s.name?.toLowerCase().trim() === severityName.toLowerCase().trim() ||
        String(s.id) === severityName
    ) || severitiesList[0];

    // Match defect type
    let matchedDefectType: any = null;
    if (typeName) {
      matchedDefectType = defectTypesList.find(
        (dt: any) =>
          (dt.name || dt.defectTypeName)?.toLowerCase().trim() === typeName.toLowerCase().trim() ||
          String(dt.id) === typeName
      );
    }

    const defectTypeIdToSend = matchedDefectType?.id
      ? Number(matchedDefectType.id)
      : (matchedExisting?.defectTypeId ? Number(matchedExisting.defectTypeId) : (defectTypesList[0]?.id ? Number(defectTypesList[0].id) : undefined));

    const payload = {
      name: finalName,
      description: finalDescription,
      detailsSteps: steps || finalDescription,
      severityId: matchedSeverity?.id ? Number(matchedSeverity.id) : undefined,
      defectTypeId: defectTypeIdToSend,
    };

    try {
      let res: any;
      if (matchedExisting?.id) {
        // Update existing testcase because description or steps changed
        res = await updateTestCase(Number(subModuleIdToUse), Number(matchedExisting.id), payload);
      } else {
        // Create new testcase
        res = await createTestCase(Number(subModuleIdToUse), payload);
      }

      if (
        res?.status === "Created" ||
        res?.status === "Success" ||
        res?.statusCode === 201 ||
        res?.statusCode === 200 ||
        res?.data?.id
      ) {
        importedCount++;
      } else {
        failedCount++;
        errors.push(`Row ${rowNum}: ${res?.statusMessage || res?.message || "Failed to import test case"}`);
      }
    } catch (err: any) {
      failedCount++;
      errors.push(`Row ${rowNum}: ${err?.response?.data?.message || err.message || "Error"}`);
    }
  }

  const successMessage =
    importedCount > 0
      ? `Test cases imported/updated: ${importedCount} of ${rows.length} successful${
          skippedCount > 0 ? `, ${skippedCount} unchanged items skipped.` : "."
        }`
      : `0 test cases updated, all ${skippedCount} items had no changes to description or steps.`;

  return {
    status: importedCount > 0 || skippedCount > 0 ? "success" : "failure",
    statusCode: importedCount > 0 || skippedCount > 0 ? 200 : 400,
    message: successMessage,
    data: {
      importedCount,
      skippedCount,
      failedCount,
      total: rows.length,
      errors,
    },
  };
};

export const testAuthHeader = async (): Promise<void> => {
  return Promise.resolve();
};