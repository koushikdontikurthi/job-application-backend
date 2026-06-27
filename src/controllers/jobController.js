const jobService = require("../services/jobService");
const {get, set, del} = require("../cache");

const createJob = async (req, res, next) => {
  try {
    const { title, company } = req.body;
    const userId = req.user.userId;
    const result = await jobService.createJob(title, company, userId);
    return res.status(201).json({
      message: "Job created successfully",
      job: result
    });
  } catch (error) {
    next(error);
  }
};

const getJobs = async (req, res, next) => {
  try {
    const result = await jobService.getJobs();
    return res.status(200).json({
      jobs: result
    });
  } catch (error) {
    next(error);
  }
};


const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `job_${id}`;
    const cachedJob = get(cacheKey);
    if (cachedJob) {
      return res.status(200).json({ job: cachedJob });
    }

    const result = await jobService.getJobById(id);

    const job = result;

    if (!job) {
      return res.status(404).json({
        code: "JOB_NOT_FOUND",
        message: "Job not found"
      });
    }

    set(cacheKey, job, 60000); // Cache for 1 minute
    return res.status(200).json({
      job
    });
  } catch (error) {
    next(error);
  }
  
};

const updateJob = async (req, res, next) => {
    try {
    const { id } = req.params;
    const { title, company } = req.body;
    const userId = req.user.userId;
    const result = await jobService.updateJob(id, title, company, userId);

    if (!result) {
      return res.status(404).json({
        code: "JOB_NOT_FOUND",
        message: "Job not found"
      });
    }

    del(`job_${id}`);
    return res.status(200).json({
      message: "Job updated successfully",
      job: result
    });
    } catch (error) {
        next(error);
    }
};

const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const result = await jobService.deleteJob(id, userId);
    if (!result) {
      return res.status(404).json({
        code: "JOB_NOT_FOUND",
        message: "Job not found or you are not allowed to delete this job"
      });
    }
    del(`job_${id}`);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob };