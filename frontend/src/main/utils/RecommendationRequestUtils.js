import { toast } from "react-toastify";

// The DELETE endpoint responds with { message: "..." }; toast needs the text itself
export function onDeleteSuccess(response) {
  console.log(response.message);
  toast(response.message);
}

export function cellToAxiosParamsDelete(cell) {
  return {
    url: "/api/RecommendationRequest",
    method: "DELETE",
    params: {
      id: cell.row.original.id,
    },
  };
}
