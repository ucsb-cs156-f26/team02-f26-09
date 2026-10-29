import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/MenuItemReviewUtils";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/useCurrentUser";

export default function MenuItemReviewTable({ reviews, currentUser }) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/menuitemreviews/edit/${cell.row.original.id}`);
  };

  // Stryker disable all : hard to test for query caching
  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/MenuItemReview/all"],
  );
  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    { header: "id", accessorKey: "id" },
    { header: "Item Id", accessorKey: "itemId" },
    { header: "Reviewer Email", accessorKey: "reviewerEmail" },
    { header: "Stars", accessorKey: "stars" },
    { header: "Date Reviewed", accessorKey: "dateReviewed" },
    { header: "Comments", accessorKey: "comments" },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(
      ButtonColumn("Edit", "primary", editCallback, "MenuItemReviewTable"),
    );
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, "MenuItemReviewTable"),
    );
  }

  return (
    <OurTable data={reviews} columns={columns} testid={"MenuItemReviewTable"} />
  );
}
