import classModel from "../models/class.model.js"

const getAttendanceData = async(classId) => {
    const classDoc = await classModel
  .findById(classId)
  .populate("students", "name rollNo");

  console.log(classDoc);
  
}
getAttendanceData("69888e8d22f483deb7aab83e")


export default getAttendanceData