import React from "react";
import ucsbdiningcommonsmenuitemTable from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemTable";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "components/UCSBDiningCommonsMenuItem/ucsbdiningcommonsmenuitemTable",
  component: ucsbdiningcommonsmenuitemTable,
};

const Template = (args) => {
  return <ucsbdiningcommonsmenuitemTable {...args} />;
};

export const Empty = Template.bind({});

Empty.args = {
  UCSBDiningCommonsMenuItem: [],
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.args = {
  UCSBDiningCommonsMenuItem:
    ucsbDiningCommonsMenuItemFixtures.threeDiningCommonsMenuItems,
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.args = {
  UCSBDiningCommonsMenuItem:
    ucsbDiningCommonsMenuItemFixtures.threeDiningCommonsMenuItems,
  currentUser: currentUserFixtures.adminUser,
};

ThreeItemsAdminUser.parameters = {
  msw: [
    http.delete("/api/ucsbdiningcommonsmenuitem", () => {
      return HttpResponse.json(
        { message: "UCSBDiningCommonsMenuItem deleted successfully" },
        { status: 200 },
      );
    }),
  ],
};
