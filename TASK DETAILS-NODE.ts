const particularTask = async (req, res) => {
  try {
    const {
      employeeId,
      projectId,
      day,
      toDate,
      taskId,
      todayTaskDate,
      searchTerm,
      page = 1,
      limit = 10,
    } = req.query;

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    // Base filter
    const baseFilter = {};
    // Date filter
    if (todayTaskDate) {
      const [year, month, date] = todayTaskDate.split("-");
      const startOfDay = new Date(Date.UTC(year, month - 1, date, 0, 0, 0));
      const endOfDay = new Date(
        Date.UTC(year, month - 1, date, 23, 59, 59, 999),
      );
      baseFilter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    //  Date filter
    if (day || toDate) {
      baseFilter.createdAt = {};
      if (day) {
        const [year, month, date] = day.split("-");
        baseFilter.createdAt.$gte = new Date(
          Date.UTC(year, month - 1, date, 0, 0, 0),
        );
      }
      if (toDate) {
        const [year, month, date] = toDate.split("-");
        baseFilter.createdAt.$lte = new Date(
          Date.UTC(year, month - 1, date, 23, 59, 59, 999),
        );
      }
    }

    //  Project filter
    if (projectId) {
      baseFilter.projectId = new mongoose.Types.ObjectId(projectId);
    }

    //  Task ID filter
    if (taskId) {
      baseFilter.taskId = { $regex: taskId, $options: "i" };
    }

    //  Employee filter
    let employeeProjects = [];
    let projectIds = [];
    let employeeObjectId;

    if (employeeId) {
      employeeObjectId = new mongoose.Types.ObjectId(employeeId);

      employeeProjects = await ProjectModel.find({
        $or: [
          { projectManager: employeeId },
          { teamMembers: { $in: [employeeId] } },
        ],
      }).select("_id");
      console.log("employeeProjects", employeeProjects);

      projectIds = employeeProjects.map((p) => p._id);
    }

    //  Search conditions (including populated fields)
    const searchConditions = searchTerm
      ? [
          { title: { $regex: searchTerm, $options: "i" } },
          // { description: { $regex: searchTerm, $options: "i" } },
          { taskId: { $regex: searchTerm, $options: "i" } },
          { "assignedTo.employeeName": { $regex: searchTerm, $options: "i" } },
          { "projectId.name": { $regex: searchTerm, $options: "i" } },
        ]
      : [];

    //  Helper: Aggregation pipeline builder
    const buildPipeline = (
      statusFilter,
      extraMatch = {},
      countOnly = false,
    ) => {
      const pipeline = [
        { $match: { ...baseFilter, ...extraMatch } },
        {
          $lookup: {
            from: "employees",
            localField: "assignedTo",
            foreignField: "_id",
            as: "assignedTo",
          },
        },
        { $unwind: { path: "$assignedTo", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "projects",
            localField: "projectId",
            foreignField: "_id",
            as: "projectId",
          },
        },
        { $unwind: { path: "$projectId", preserveNullAndEmptyArrays: true } },
      ];

      /* 🔥 EMPLOYEE COMMON CHECK (STRING BASED) */
      if (employeeId) {
        pipeline.push({
          $match: {
            $or: [
              // { assignedTo: employeeId },                 // assigned task
              { "projectId.projectManager": employeeId }, // project manager
              { "projectId.teamMembers": employeeId }, // team member
            ],
          },
        });
      }

      if (statusFilter) pipeline.push({ $match: { status: statusFilter } });
      if (searchConditions.length > 0) {
        pipeline.push({ $match: { $or: searchConditions } });
      }

      if (countOnly) {
        pipeline.push({ $count: "count" });
        return pipeline;
      }

      pipeline.push(
        { $sort: { createdAt: -1 } },
        { $skip: (pageInt - 1) * limitInt },
        { $limit: limitInt },
      );

      return pipeline;
    };

    //  Employee-based filters
    const todoExtraMatch = {};
    const otherExtraMatch = {};

    if (employeeId) {
      todoExtraMatch.$or = [
        { assignedTo: employeeObjectId },
        { assignedTo: { $exists: false },
        projectId: { $in: projectIds } },
        { assignedTo: null, projectId: { $in: projectIds } },
        { projectManagerId: employeeObjectId },
      ];

      otherExtraMatch.$or = [
        { assignedTo: employeeObjectId },
        { projectManagerId: employeeObjectId },
      ];
    }

    //  Fetch tasks by status (with search-aware counts)
    const taskByStatus = {};

    // --- ToDo ---
    const [taskToDo, todoCountResult] = await Promise.all([
      Task.aggregate(buildPipeline("todo", todoExtraMatch)),
      Task.aggregate(buildPipeline("todo", todoExtraMatch, true)),
    ]);
    const todoCount = todoCountResult[0]?.count || 0;
    taskByStatus["todo"] = { tasks: taskToDo, count: todoCount };

    // --- Other statuses ---
    const statusList = [
      "in-progress",
      "in-review",
      "done",
      "block",
      "completed",
    ];

    for (const status of statusList) {
      const [tasks, countResult] = await Promise.all([
        Task.aggregate(buildPipeline(status, otherExtraMatch)),
        Task.aggregate(buildPipeline(status, otherExtraMatch, true)),
      ]);
      const count = countResult[0]?.count || 0;
      taskByStatus[status] = { tasks, count };
    }

    //  Today's tasks
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayPipeline = [
      {
        $match: {
          ...baseFilter,
          ...otherExtraMatch,
          createdAt: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "assignedTo",
          foreignField: "_id",
          as: "assignedTo",
        },
      },
      { $unwind: { path: "$assignedTo", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "projects",
          localField: "projectId",
          foreignField: "_id",
          as: "projectId",
        },
      },
      { $unwind: { path: "$projectId", preserveNullAndEmptyArrays: true } },
      {
        $match: employeeId
          ? {
              $or: [
                { "project.projectManager": employeeId },
                { "project.teamMembers": employeeId },
              ],
            }
          : {},
      },
    ];

    if (searchConditions.length > 0) {
      todayPipeline.push({ $match: { $or: searchConditions } });
    }

    const todayTasks = await Task.aggregate(todayPipeline);

    //  Counts and pagination info
    const totalProjectCount = employeeId
      ? await ProjectModel.countDocuments({
          $or: [
            { projectManagerId: employeeId },
            { teamMembers: { $in: [employeeId] } },
          ],
        })
      : await ProjectModel.countDocuments();

    const totalUserTasks = await Task.countDocuments({
      ...baseFilter,
      ...otherExtraMatch,
    });

    const statusCounts = {
      todo: todoCount,
      ...Object.fromEntries(statusList.map((s) => [s, taskByStatus[s].count])),
    };

    const findMaxValue = Math.max(...Object.values(statusCounts));

    //  Final response
    res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      pagination: {
        currentPage: pageInt,
        limit: limitInt,
        totalTodoTasks: findMaxValue,
        totalPages: Math.ceil(findMaxValue / limitInt),
      },
      counts: {
        totalProjectCount,
        totalUserTasks,
        todayTasks: todayTasks.length,
      },
      data: {
        taskToDo,
        taskInProcess: taskByStatus["in-progress"].tasks,
        taskInReview: taskByStatus["in-review"].tasks,
        taskDone: taskByStatus["done"].tasks,
        taskBlock: taskByStatus["block"].tasks,
        // taskCompleted: taskByStatus["completed"].tasks,
        todayTasks,
        statusCounts,
      },
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching tasks",
      error: error.message,
    });
  }
};