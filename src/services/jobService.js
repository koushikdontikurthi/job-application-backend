const jobRepo = require("../repos/jobRepo");

const createJob = async (title, company, userId) => {
  const result = await jobRepo.insert(title, company, userId);
  return result;
}


const getJobs = async () => {
  const result = await jobRepo.findAll();
    return result;
}   

const getJobById = async (id) => {
  const result = await jobRepo.findById(id);
  return result;
}

const updateJob = async (id, title, company, userId) => {
    const existing = await jobRepo.findById(id);
    const job = existing;
    if (!job) return null;
    if (job.user_id !== userId) throw { status: 403, code: 'FORBIDDEN', message: 'You are not allowed to update this job' };

    const result = await jobRepo.update(id, title, company);
    return result;
};
const deleteJob = async (id, userId) => {
  const result = await jobRepo.softDelete(id, userId);
    return result;
}

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob };