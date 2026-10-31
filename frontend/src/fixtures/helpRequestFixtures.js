const helpRequestFixtures = {
  oneHelpRequest: {
    id: 1,
    requesterEmail: "cgaucho@ucsb.edu",
    teamId: "s22-5pm-3",
    tableOrBreakoutRoom: "7",
    explanation: "Need help with Swagger-ui",
    requestTime: "2022-04-20T17:35:00",
    solved: false,
  },
  threeHelpRequests: [
    {
      id: 1,
      requesterEmail: "cgaucho@ucsb.edu",
      teamId: "s22-5pm-3",
      tableOrBreakoutRoom: "7",
      explanation: "Need help with Swagger-ui",
      requestTime: "2022-04-20T17:35:00",
      solved: false,
    },
    {
      id: 2,
      requesterEmail: "ldelplaya@ucsb.edu",
      teamId: "s22-6pm-4",
      tableOrBreakoutRoom: "11",
      explanation: "Dokku problems",
      requestTime: "2022-04-21T18:10:00",
      solved: true,
    },
    {
      id: 3,
      requesterEmail: "rmorales@ucsb.edu",
      teamId: "s22-7pm-2",
      tableOrBreakoutRoom: "Breakout Room 3",
      explanation: "Merge conflict in pom.xml",
      requestTime: "2022-04-22T19:05:00",
      solved: false,
    },
  ],
};

export { helpRequestFixtures };
