import { getClerkUserIdsService, getUserAccessLevelService, getUserPatientAccountsService } from '../services/userService.js';
import jwt from 'jsonwebtoken';


export const fetchUserAccessLevel = async (req, res, next) => {
    try {
        const { patientId } = req.body;
        const path = req.path;
        const token = req.cookies ? req.cookies['patientToken'] : null;
        if (!token) {
            //get the patient ID from the body then set the token appropriately - if there isn't a patient ID, then return an error
            if (patientId) {
                const userId = req.auth.userId;
                const user = await getClerkUserIdsService(userId);
                if (!user) {
                    return res.status(403).json({ error: 'You do not have access to this patient' });
                }
                const patientsUserHasAccessTo = await getUserPatientAccountsService(user.id);
                // check is the userId has access to the patientId
                const hasAccess = patientsUserHasAccessTo.some((patient) => patient.patientId === patientId);
                if (!hasAccess) {
                    return res.status(403).json({ error: 'You do not have access to this patient' });
                }


                const token = jwt.sign({ patientId }, process.env.PATIENT_PORTAL_SECRET, { expiresIn: '168h' });
                try {
                    res.cookie('patientToken', token, {
                        httpOnly: true,
                        secure: false
                    });
                    res.status(200).send('Patient ID set');
                } catch (error) {
                    console.log(error)
                }

            } else {
                path !== '/auth/access' ? res.status(403).send('Unauthorized to view this page') : next();
            }

        } else {
            const decoded = jwt.verify(token, process.env.PATIENT_PORTAL_SECRET);
            const tokenPatientId = decoded.patientId;
            //todo: lots of duplicated code here, come back and clean up
            if (patientId) {
                //check if the patientID sent matches the patientID in the token if not expire the existing token and issue a new one
                if (tokenPatientId !== patientId) {
                    const userId = req.auth.userId;
                    const user = await getClerkUserIdsService(userId);
                    const patientsUserHasAccessTo = await getUserPatientAccountsService(user.id);
                    // check is the userId has access to the patientId
                    const hasAccess = patientsUserHasAccessTo.some((patient) => patient.patientId === tokenPatientId);
                    if (!hasAccess) {
                        res.clearCookie('patientToken');
                        return res.status(403).json({ error: 'You do not have access to this patient' });
                    }

                    const token = jwt.sign({ patientId }, process.env.PATIENT_PORTAL_SECRET, { expiresIn: '168h' });
                    try {
                        res.cookie('patientToken', token, {
                            httpOnly: true,
                            secure: true,
                            sameSite: 'None',
                            maxAge: 7 * 24 * 60 * 60 * 1000,
                        });
                        res.status(200).send('Patient ID set');
                    }
                    catch (error) {
                        console.log(error)
                    }
                }
            }
            const userId = req.auth.userId;
            const user = await getClerkUserIdsService(userId);
            const clerkUserId = user.id;
            const patientsUserHasAccessTo = await getUserPatientAccountsService(user.id);
            // check is the userId has access to the patientId
            const hasAccess = patientsUserHasAccessTo.some((patient) => patient.patientId === tokenPatientId);
            if (!hasAccess) {
                return res.status(403).json({ error: 'You do not have access to this patient' });
            }
            const accessLevel = await getUserAccessLevelService({ userId: clerkUserId, patientId: tokenPatientId });
            if (accessLevel !== null) {
                req.accessLevel = accessLevel;
                req.patientId = tokenPatientId;
                next();
            } else {
                res.status(404).send('User not found or access level not set');
            }

        }

    } catch (error) {
        console.error('Service error:', error);
        // res.status(500).send('Internal Server Error');
    }
};


export default fetchUserAccessLevel;



