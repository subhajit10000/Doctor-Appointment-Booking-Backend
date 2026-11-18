// Usage: npm run seed          (adds sample doctors if the collection is empty)
//        npm run seed -- --reset   (wipes doctors and appointments first)
import mongoose from "mongoose";
import "../src/config/env.js";
import env from "../src/config/env.js";
import Doctor from "../src/models/Doctor.js";
import Appointment from "../src/models/Appointment.js";

const wk = (days, start, end) => days.map((day) => ({ day, start, end }));
const MON_FRI = [1, 2, 3, 4, 5];
const MON_SAT = [1, 2, 3, 4, 5, 6];

const doctors = [
    { name: "Dr. Ananya Rao", specialization: "Cardiologist", qualification: "MD, DM Cardiology", experienceYears: 14, fee: 900, clinic: "Heartline Clinic", city: "Bengaluru", languages: ["English", "Kannada", "Hindi"], about: "Interventional cardiologist focused on preventive heart care, hypertension and post-bypass recovery.", availability: [...wk(MON_FRI, "09:00", "13:00"), ...wk([1, 3, 5], "16:00", "19:00")], slotMinutes: 30 },
    { name: "Dr. Rohan Mehta", specialization: "Dermatologist", qualification: "MD Dermatology", experienceYears: 9, fee: 600, clinic: "ClearSkin Studio", city: "Mumbai", languages: ["English", "Hindi", "Marathi"], about: "Treats acne, eczema, hair loss and pigmentation, with a focus on evidence-based routines.", availability: wk(MON_SAT, "10:00", "17:00"), slotMinutes: 20 },
    { name: "Dr. Kavya Nair", specialization: "Pediatrician", qualification: "MD Pediatrics", experienceYears: 11, fee: 500, clinic: "Little Steps Children's Care", city: "Kochi", languages: ["English", "Malayalam", "Hindi"], about: "Well-baby visits, vaccinations, growth and nutrition, and common childhood illnesses.", availability: wk(MON_SAT, "09:30", "14:00"), slotMinutes: 20 },
    { name: "Dr. Imran Qureshi", specialization: "Orthopedic Surgeon", qualification: "MS Orthopedics", experienceYears: 18, fee: 1100, clinic: "BoneWell Hospital", city: "Hyderabad", languages: ["English", "Hindi", "Urdu", "Telugu"], about: "Joint replacement, sports injuries and fracture care.", availability: [...wk([1, 2, 4], "10:00", "14:00"), ...wk([6], "10:00", "13:00")], slotMinutes: 30 },
    { name: "Dr. Priya Sharma", specialization: "Gynecologist", qualification: "MS Obstetrics & Gynecology", experienceYears: 12, fee: 800, clinic: "Aarogya Women's Clinic", city: "Delhi", languages: ["English", "Hindi", "Punjabi"], about: "Pregnancy care, PCOS, fertility counselling and routine women's health checks.", availability: wk(MON_SAT, "11:00", "16:00"), slotMinutes: 30 },
    { name: "Dr. Arjun Pillai", specialization: "General Physician", qualification: "MBBS, MD General Medicine", experienceYears: 8, fee: 400, clinic: "FirstCare Family Clinic", city: "Bengaluru", languages: ["English", "Malayalam", "Tamil", "Hindi"], about: "Fever, infections, diabetes and blood pressure follow-ups, and annual health checks.", availability: [...wk(MON_SAT, "09:00", "13:00"), ...wk(MON_FRI, "17:00", "20:00")], slotMinutes: 15 },
    { name: "Dr. Sneha Kulkarni", specialization: "Neurologist", qualification: "DM Neurology", experienceYears: 15, fee: 1200, clinic: "NeuroCare Centre", city: "Pune", languages: ["English", "Marathi", "Hindi"], about: "Migraine, epilepsy, stroke recovery and movement disorders.", availability: wk([2, 3, 4], "10:00", "15:00"), slotMinutes: 30 },
    { name: "Dr. Vikram Singh", specialization: "ENT Specialist", qualification: "MS ENT", experienceYears: 10, fee: 550, clinic: "Clarity ENT Clinic", city: "Delhi", languages: ["English", "Hindi"], about: "Sinus problems, hearing loss, tonsil and throat conditions.", availability: wk(MON_FRI, "12:00", "18:00"), slotMinutes: 20 },
    { name: "Dr. Meera Iyer", specialization: "Psychiatrist", qualification: "MD Psychiatry", experienceYears: 13, fee: 1000, clinic: "Calm Mind Clinic", city: "Chennai", languages: ["English", "Tamil", "Hindi"], about: "Anxiety, depression, sleep problems and stress. Unhurried 45-minute consultations.", availability: wk([1, 2, 3, 4, 5], "10:00", "17:00"), slotMinutes: 45 },
    { name: "Dr. Farhan Ali", specialization: "Dentist", qualification: "BDS, MDS Endodontics", experienceYears: 7, fee: 450, clinic: "BrightSmile Dental", city: "Hyderabad", languages: ["English", "Hindi", "Urdu"], about: "Check-ups, root canals, cleanings and cosmetic dentistry.", availability: wk(MON_SAT, "10:00", "19:00"), slotMinutes: 30 },
    { name: "Dr. Lakshmi Menon", specialization: "Endocrinologist", qualification: "DM Endocrinology", experienceYears: 16, fee: 950, clinic: "Metabolic Health Institute", city: "Chennai", languages: ["English", "Tamil", "Malayalam"], about: "Diabetes, thyroid disorders and hormonal conditions.", availability: [...wk([1, 3, 5], "09:00", "13:00"), ...wk([2], "15:00", "18:00")], slotMinutes: 30 },
    { name: "Dr. Neil D'Souza", specialization: "Ophthalmologist", qualification: "MS Ophthalmology", experienceYears: 9, fee: 650, clinic: "ClearView Eye Care", city: "Mumbai", languages: ["English", "Hindi", "Konkani"], about: "Eye exams, cataract assessment, dry eye and vision correction.", availability: wk(MON_SAT, "09:00", "15:00"), slotMinutes: 20 },
];

await mongoose.connect(env.MONGO_URI);
if (process.argv.includes("--reset")) {
    await Promise.all([Doctor.deleteMany({}), Appointment.deleteMany({})]);
    console.log("Cleared doctors and appointments.");
}
if ((await Doctor.countDocuments()) === 0) {
    await Doctor.insertMany(doctors);
    console.log(`Added ${doctors.length} sample doctors.`);
} else {
    console.log("Doctors already exist. Use --reset to start over.");
}
await mongoose.disconnect();
