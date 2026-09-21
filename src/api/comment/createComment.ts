import apiClient from "../../lib/api";
import { ENDPOINTS } from "../../utils/apiendpoint";

export const createComment = async (defectIdOrData: any, maybeData?: any) => {
  let defectId: number;
  let data: any;

  if (typeof defectIdOrData === "object" && defectIdOrData !== null) {
    defectId = Number(defectIdOrData.defectId);
    data = defectIdOrData;
  } else {
    defectId = Number(defectIdOrData);
    data = maybeData;
  }

  const r = await apiClient.post(ENDPOINTS.defectComment(defectId), data);
  return r.data;
};

export const updateComment = async (commentIdOrDefectId: any, textOrCommentId?: any, maybeData?: any) => {
  let url: string;
  let payload: any;

  if (maybeData !== undefined) {
    // updateComment(defectId, commentId, data)
    url = `${ENDPOINTS.defectComment(Number(commentIdOrDefectId))}/${textOrCommentId}`;
    payload = maybeData;
  } else if (typeof textOrCommentId === "string" || (typeof textOrCommentId === "object" && textOrCommentId !== null)) {
    // updateComment(commentId, commentText)
    url = `/api/v1/defect/comment/${commentIdOrDefectId}`;
    payload = typeof textOrCommentId === "string" ? { comment: textOrCommentId } : textOrCommentId;
  } else {
    url = `/api/v1/defect/comment/${commentIdOrDefectId}`;
    payload = {};
  }

  const r = await apiClient.put(url, payload);
  return r.data;
};
