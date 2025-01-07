import express from "express";
const router = express.Router();

router.post("/set-patient", (req, res) => {
    try {
        res.status(200).send('Patient ID set');
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

router.post("/", (req, res) => {
    try {
        //clear the cookie 
        res.clearCookie('patientToken');
        res.status(200).send('logged out');
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});




export default router;
