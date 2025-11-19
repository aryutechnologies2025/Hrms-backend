
import Settings from "../models/settings.js";

export const formatDateTime = async (dateInput = new Date()) => {
    console.log("dateInput",dateInput);
  const date = new Date(dateInput);   // Convert ISO -> Date object

  const settings = await Settings.findOne().select("date_format time_format -_id");

  // Default formats if DB empty
  const dateFormat = settings?.date_format || "DD/MM/YYYY";
  const timeFormat = settings?.time_format || "hh:mm A"; // 12h AM/PM

  // ---- DATE PART ----
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();

  const dateMap = { DD: d, MM: m, YYYY: y };
  const formattedDate = dateFormat.replace(/DD|MM|YYYY/g, (m) => dateMap[m]);

  // ---- TIME PART (AM/PM) ----
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  if (hours === 0) hours = 12;         // 00 → 12 AM
  else if (hours > 12) hours -= 12;    // 13 → 1 PM

  const hh = String(hours).padStart(2, "0");

  const timeMap = { hh, mm: minutes, A: ampm };
  const formattedTime = timeFormat.replace(/hh|mm|A/g, (m) => timeMap[m]);

  // ---- FINAL RETURN ----
  return {
    date: formattedDate,
    time: formattedTime,
    dateTime: `${formattedDate} ${formattedTime}`,
  };
};
export default formatDateTime;
