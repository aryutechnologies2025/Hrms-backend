import JobType from "../models/jobTypeModel.js";
import JobSource from "../models/jobSourceModel.js";
import JobInterview from "../models/jobInterviewModel.js";
import JobOpening from "../models/jobOpeningModel.js";
import Candidate from "../models/candidateModel.js";
import mongoose from "mongoose";
import Source from "../models/sourceModel.js";

const createJobType = async (req, res) => {
  try {
    const { name, status } = req.body;
    const existingName = await JobType.findOne({ name });
    if (existingName) {
      return res
        .status(400)
        .json({ success: false, errors: { name: "Job type already exists" } });
    }

    const jobType = new JobType(req.body);
    await jobType.save();
    res.status(201).json({ message: "Job Type created successfully", jobType });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ errors });
    } else {
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
    res.status(400).json({ error: error.message });
  }
};

const getJobType = async (req, res) => {
  try {
    const jobType = await JobType.find({});
    if (!jobType) {
      return res.status(404).json({ message: "Job Type not found" });
    }
    res.status(200).json({ message: "Job Type fetched successfully", jobType });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const editJobType = async (req, res) => {
  try {
    const { id } = req.params;
    const jobType = await JobType.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!jobType) {
      return res.status(404).json({ message: "Job Type not found" });
    }
    res.status(200).json({ message: "Job Type updated successfully", jobType });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const deleteJobType = async (req, res) => {
  try {
    const { id } = req.params;
    const jobType = await JobType.findByIdAndDelete(id);
    if (!jobType) {
      return res.status(404).json({ message: "Job Type not found" });
    }
    res.status(200).json({ message: "Job Type deleted successfully", jobType });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

//job source

const createJobSource = async (req, res) => {
  try {
    const jobSource = new JobSource(req.body);
    await jobSource.save();
    res
      .status(201)
      .json({ message: "Job Source created successfully", jobSource });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ errors });
    } else {
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
    res.status(400).json({ error: error.message });
  }
};

const getJobSource = async (req, res) => {
  try {
    const jobSource = await JobSource.find({});
    if (!jobSource) {
      return res.status(404).json({ message: "Job Source not found" });
    }
    res
      .status(200)
      .json({ message: "Job Source fetched successfully", jobSource });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const editJobSource = async (req, res) => {
  try {
    const { id } = req.params;
    const jobSource = await JobSource.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!jobSource) {
      return res.status(404).json({ message: "Job Source not found" });
    }
    res
      .status(200)
      .json({ message: "Job Source updated successfully", jobSource });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const deleteJobSource = async (req, res) => {
  try {
    const { id } = req.params;
    const jobSource = await JobSource.findByIdAndDelete(id);
    if (!jobSource) {
      return res.status(404).json({ message: "Job Source not found" });
    }
    res
      .status(200)
      .json({ message: "Job Source deleted successfully", jobSource });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

//interview

const createJobInterview = async (req, res) => {
  try {
    const jobInterview = new JobInterview(req.body);
    const { name, status } = req.body;
    const existingName = await JobInterview.findOne({ name });
    if (existingName) {
      return res
        .status(400)
        .json({ success: false, errors: { name: "Name already exists" } });
    }
    await jobInterview.save();
    res
      .status(201)
      .json({ message: "Job Interview created successfully", jobInterview });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ errors });
    } else {
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
    res.status(400).json({ error: error.message });
  }
};

const getJobInterview = async (req, res) => {
  try {
    const jobInterview = await JobInterview.find({});
    if (!jobInterview) {
      return res.status(404).json({ message: "Job Interview not found" });
    }
    res
      .status(200)
      .json({ message: "Job Interview fetched successfully", jobInterview });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const editJobInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const jobInterview = await JobInterview.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!jobInterview) {
      return res.status(404).json({ message: "Job Interview not found" });
    }
    res.status(200).json({ message: "Job Interview updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const deleteJobInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const jobInterview = await JobInterview.findByIdAndDelete(id);
    if (!jobInterview) {
      return res.status(404).json({ message: "Job Interview not found" });
    }
    res
      .status(200)
      .json({ message: "Job Type deleted successfully", jobInterview });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const createJobOpening = async (req, res) => {
  const {
    jobType,
    jobTitle,
    jobDescription,
    jobRequirement,
    startFrom,
    endingTo,
    note,
    status,
  } = req.body;

  const jobTypeId = jobType.length > 0;
  try {
    const jobOpening = new JobOpening({
      ...(jobType.length > 0 ? jobType : null),
      jobTitle,
      jobDescription,
      jobRequirement,
      startFrom,
      endingTo,
      note,
      status,
    });
    await jobOpening.save();
    res
      .status(201)
      .json({ message: "Job Opening created successfully", jobOpening });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ errors });
    } else {
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
    res.status(400).json({ error: error.message });
  }
};

const editJobOpening = async (req, res) => {
  try {
    const { id } = req.params;
    const jobType = await JobOpening.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!jobType) {
      return res.status(404).json({ message: "Job Opening not found" });
    }
    res
      .status(200)
      .json({ message: "Job Opening updated successfully", jobType });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const getJobOpening = async (req, res) => {
  const getJobOpening = await JobOpening.find({}).populate("jobType", "name");
  if (!getJobOpening) {
    return res.status(404).json({ message: "Job Opening not found" });
  }
  res
    .status(200)
    .json({ message: "Job Opening fetched successfully", getJobOpening });
};

const deleteJobOpening = async (req, res) => {
  try {
    const { id } = req.params;
    const jobOpening = await JobOpening.findByIdAndDelete(id);
    if (!jobOpening) {
      return res.status(404).json({ message: "Job Opening not found" });
    }
    res
      .status(200)
      .json({ message: "Job Opening deleted successfully", jobOpening });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const getJobAccountName = async (req, res) => {
  const getFinanceName = await JobType.find({ status: "1" }).select("name");
  if (!getFinanceName) {
    return res.status(404).json({ message: "Finance Company not found" });
  }
  res
    .status(200)
    .json({ message: "Finance Company fetched successfully", getFinanceName });
};

const getNameforCandidate = async (req, res) => {
  const { type } = req.query;
  let getFinanceName;

  if (type === "interview") {
    getFinanceName = await JobInterview.find({ status: "1" }).select("name");
  }
  if (type === "source") {
    getFinanceName = await JobSource.find({ status: "1" }).select("name");
  }

  if (!getFinanceName || getFinanceName.length === 0) {
    return res.status(404).json({ message: `${type} not found` });
  }

  res
    .status(200)
    .json({ message: `Finance Company fetched successfully`, getFinanceName });
};

const createCandidate = async (req, res) => {
  const {
    firstName,
    lastName,
    phoneNumber,
    email,
    address,
    readyToRelocate,
    employeeType,
    interviewStatus,
    platform,
    notes,
    yearOfExperience,
    currentCtc,
    expectedCtc,
    source,
    createdBy,
  } = req.body;
  try {
    const jobCandidate = new Candidate({
      firstName,
      lastName,
      phoneNumber,
      email,
      address,
      readyToRelocate,
      employeeType,
      interviewStatus,
      platform,
      notes,
      yearOfExperience,
      currentCtc,
      expectedCtc,
      source,
      createdBy,
    });
    await jobCandidate.save();
    res
      .status(201)
      .json({ message: "Job Candidate created successfully", jobCandidate });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ errors });
    } else {
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
    res.status(400).json({ error: error.message });
  }
};

// const getCandidate = async (req, res) => {
//   const { id } = req.query;
//   if (id) {
//     try {
//       const records = await Candidate.find({ interviewStatus: id })
//         .populate("interviewStatus", "name")
//         .populate("platform", "name")
//         .populate("source", "name")
//         .populate("createdBy", "name")
//         .sort({ createdAt: -1 });

//       res.status(200).json({
//         success: true,
//         data: records,
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ success: false, message: "Server Error" });
//     }
//   } else {
//     try {
//       const getJobCandidate = await Candidate.find()
//         .populate("interviewStatus", "name")
//         .populate("platform", "name")
//         .populate("createdBy", "name")
//         .populate("source", "name")
//         .sort({ createdAt: -1 });
//       if (!getJobCandidate.length) {
//         return res.status(404).json({ message: "Job Candidate not found" });
//       }
//       res.status(200).json({
//         message: "Job Candidate fetched successfully",
//         data: getJobCandidate,
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ success: false, message: "Server Error" });
//     }
//   }
// };


const getCandidate = async (req, res) => {
  try {
    const {
      id,
      status,
      source,
      technology,
      candidateName,
      createdByName,
      search,
      fromDate,
      toDate,
      page = 1,
      limit = 10,
    } = req.query;

    const match = {};

    /* ===== ID FILTER ===== */
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      match._id = new mongoose.Types.ObjectId(id);
    }

    /* ===== DATE FILTER ===== */
    // if (fromDate || toDate) {
    //   match.createdAt = {};
    //   if (fromDate) match.createdAt.$gte = new Date(fromDate);
    //   if (toDate) match.createdAt.$lte = new Date(toDate);
    // }
     if (fromDate || toDate) {
      matchStage.$match.createdAt = {};
      if (fromDate) {
        const [year, month, date] = fromDate.split("-");
         match.createdAt.$gte = new Date(
          Date.UTC(year, month - 1, date, 0, 0, 0)
        );
      }
      if (toDate) {
        const [year, month, date] = toDate.split("-");
        match.createdAt.$lte = new Date(
          Date.UTC(year, month - 1, date, 23, 59, 59, 999)
        );
      }
    } 

    /* ===== CANDIDATE NAME FILTER ===== */
    if (candidateName) {
      match.$or = [
        { firstName: { $regex: candidateName, $options: "i" } },
        { lastName: { $regex: candidateName, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const pipeline = [
      /* ===== INTERVIEW STATUS ===== */
      {
        $lookup: {
          from: "jobinterviews",
          localField: "interviewStatus",
          foreignField: "_id",
          as: "interviewStatus",
        },
      },
      { $unwind: { path: "$interviewStatus", preserveNullAndEmptyArrays: true } },

      /* ===== PLATFORM ===== */
      {
        $lookup: {
          from: "jobsources",
          localField: "platform",
          foreignField: "_id",
          as: "platform",
        },
      },
      { $unwind: { path: "$platform", preserveNullAndEmptyArrays: true } },

      /* ===== CREATED BY (ADMIN USERS) ===== */
      {
        $lookup: {
          from: "adminusers",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
        },
      },
      { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },

      /* ===== SOURCE ===== */
      {
        $lookup: {
          from: "sources",
          localField: "source",
          foreignField:"_id",
          as: "source",
        },
      },
      { $unwind: { path: "$source", preserveNullAndEmptyArrays: true } },
    ];
    /* ===== LOOKUP BASED FILTERS ===== */
    if (status) {
      pipeline.push({
        $match: { "interviewStatus.name": { $regex: status, $options: "i" } },
      });
    }

    if (technology) {
      pipeline.push({
        $match: { "platform.name": { $regex: technology, $options: "i" } },
      });
    }

    if (source) {
      pipeline.push({
        $match: { "source.name": { $regex: source, $options: "i" } },
      });
    }

    if (createdByName) {
      pipeline.push({
        $match: { "createdBy.name": { $regex: createdByName, $options: "i" } },
      });
    }

    /* ===== GLOBAL SEARCH (ALL FIELDS) ===== */
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phoneNumber: { $regex: search, $options: "i" } },
            { "createdBy.name": { $regex: search, $options: "i" } },
            { "interviewStatus.name": { $regex: search, $options: "i" } },
            { "platform.name": { $regex: search, $options: "i" } },
            { "source.name": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    /* ===== BASE MATCH (CANDIDATE FIELDS) ===== */
    if (Object.keys(match).length) {
      pipeline.push({ $match: match });
    }

    /* ===== SORT & PAGINATION ===== */
    pipeline.push(
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: Number(limit) }],
          total: [{ $count: "count" }],
        },
      }
    );

    const result = await Candidate.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: result[0].data,
      pagination: {
        total: result[0].total[0]?.count || 0,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error("Candidate Filter Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export default getCandidate;



const editCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const jobCandidate = await Candidate.findById(id);
    if (!jobCandidate) {
      return res.status(404).json({ message: "Job Candidate not found" });
    }
   
    jobCandidate.set(req.body);

    
    await jobCandidate.save();
    res
      .status(200)
      .json({ message: "Job Candidate updated successfully", jobCandidate });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ success: false, errors });
    }
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const jobCandidate = await Candidate.findByIdAndDelete(id);
    if (!jobCandidate) {
      return res.status(404).json({ message: "Job Candidate not found" });
    }
    res
      .status(200)
      .json({ message: "Job Candidate deleted successfully", jobCandidate });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const getJobCandidateStatus = async (req, res) => {
  try {
    const interviews = await JobInterview.find({}).select("_id name");

    const candidates = await Candidate.find({}).populate(
      "interviewStatus",
      "name"
    );

    const result = interviews.map((interview) => {
      const matchingCandidates = candidates.filter(
        (candidate) =>
          // candidate.interviewStatus?.toString() === interview._id.toString()
          candidate.interviewStatus?.name === interview.name
      );

      return {
        interviewId: interview._id,
        interviewName: interview.name || "Unnamed Interview",
        candidateList: matchingCandidates,
        count: matchingCandidates.length,
      };
    });

    res.status(200).json({
      message: "Job candidate status fetched successfully",
      result,
    });
  } catch (error) {
    console.error("Error fetching candidate status:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


const createSource = async (req, res) => {
  try {
    const jobSource = new Source(req.body);
    await jobSource.save();
    res
      .status(201)
      .json({ message: "Job Source created successfully", jobSource });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};
      for (let field in error.errors) {
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ errors });
    } else {
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
    res.status(400).json({ error: error.message });
  }
};

const getSource = async (req, res) => {
  try {
    const jobSource = await Source.find({});
    if (!jobSource) {
      return res.status(404).json({ message: "Job Source not found" });
    }
    res
      .status(200)
      .json({ message: "Job Source fetched successfully", jobSource });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const editSource = async (req, res) => {
  try {
    const { id } = req.params;
    const jobSource = await Source.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!jobSource) {
      return res.status(404).json({ message: "Job Source not found" });
    }
    res
      .status(200)
      .json({ message: "Job Source updated successfully", jobSource });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const deleteSource = async (req, res) => {
  try {
    const { id } = req.params;
    const jobSource = await Source.findByIdAndDelete(id);
    if (!jobSource) {
      return res.status(404).json({ message: "Job Source not found" });
    }
    res
      .status(200)
      .json({ message: "Job Source deleted successfully", jobSource });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export {
  createJobType,
  getJobType,
  editJobType,
  deleteJobType,
  createJobSource,
  getJobSource,
  editJobSource,
  deleteJobSource,
  createJobInterview,
  getJobInterview,
  editJobInterview,
  deleteJobInterview,

  //job opening
  createJobOpening,
  getJobOpening,
  editJobOpening,
  deleteJobOpening,
  getJobAccountName,

  //job Candidate
  createCandidate,
  getCandidate,
  editCandidate,
  deleteCandidate,
  getNameforCandidate,
  getJobCandidateStatus,

  //Source
  createSource,
  getSource,
  editSource,
  deleteSource,
};
