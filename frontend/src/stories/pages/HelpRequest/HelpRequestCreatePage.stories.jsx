import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import { http, HttpResponse } from "msw";

import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";

export default {
  title: "pages/HelpRequest/HelpRequestCreatePage",
  component: HelpRequestCreatePage,
};

const Template = () => <HelpRequestCreatePage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.post("/api/HelpRequest/post", () => {
      return HttpResponse.json(helpRequestFixtures.oneHelpRequest, {
        status: 200,
      });
    }),
  ],
};
