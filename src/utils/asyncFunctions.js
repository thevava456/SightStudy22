import AsyncStorage from '@react-native-async-storage/async-storage';

import { getUser as GetUserFromDb } from './dbFunctions';
import {defaultTargetLines, defaultQrSize, defaultEtdrsScale} from './config' ;
/**
 * Set current user name
 */
export async function setUserName({ prenom: firstName, nom: lastName }) {
    try {
        await AsyncStorage.multiSet([
            ["firstName", firstName],
            ["lastName", lastName]
        ]);
    } catch (error) {
        console.log(error);
    }
}

/**
 * Get user's first name
 */
export async function getFirstName() {
    try {
        const firstName = await AsyncStorage.getItem("firstName");
        return firstName;
    } catch (error) {
        console.log(error);
    }
}

/**
 * Get user's last name
 */
export async function getLastName() {
    try {
        const lastName = await AsyncStorage.getItem("lastName");
        return lastName;
    } catch (error) {
        console.log(error);
    }
}

/**
 * Gets user's full name
 */
export async function getFullName() {
    try {
        const fullName = await Promise.all([getFirstName(), getLastName()]);
        const userInDb = await GetUserFromDb(fullName[1], fullName[0]);
        if (userInDb !== null) return fullName.join(" ");
        else {
            await AsyncStorage.multiRemove(["firstName", "lastName"]);
            return null;
        }
    } catch (error) {
        console.log(error);
    }
}

/**
 * Set user id in AsyncStorage
 */
export async function setId(id) {
    try {
        return await AsyncStorage.setItem("id", id);
    } catch (error) {
        console.log(error);
    }
}

/**
 * Get user id from AsyncStorage.
 */
export async function getId() {
    try {
        const value = await AsyncStorage.getItem("id");
        if (value !== null) {
            return parseInt(value);
        }
        else{
            return null ;
        }
    } catch (error) {
        console.log(error);
    }
}

export async function clear() {
    try {
        return await AsyncStorage.clear();
    } catch {
        console.log("Unable to clear storage");
    }
}

export async function setDoctorEmail(email) {
    try {
        return await AsyncStorage.setItem("doctor_email", email);
    } catch {
        console.log("Error setting email");
    }
}

export async function getDoctorEmail() {
    try {
        return await AsyncStorage.getItem("doctor_email");
    } catch {
        console.log("Error getting email");
    }
}

export async function setAdminPin(pin) {
    try {
        return await AsyncStorage.setItem("admin_pin", pin);
    } catch {
        console.log("Error setting pin");
    }
}

export async function getAdminPin() {
    try {
        return await AsyncStorage.getItem("admin_pin");
    } catch {
        console.log("Error getting pin");
    }
}

export async function setTargetLines(targetLines) {
    try {
        return await AsyncStorage.setItem("target_lines", targetLines);
    } catch (e) {
        console.log("Error setting target lines :" + e);
    }
}

export async function getTargetLines() {
    try {
        const targetLines = await AsyncStorage.getItem("target_lines");
        if (targetLines !== null) return parseInt(targetLines);
        return targetLines;
    } catch {
        console.log("Error getting target lines");
    }
}

export async function setQrSize(qrSize) {
    try {
        return await AsyncStorage.setItem("qrsize", qrSize);
    } catch {
        console.log("Error setting QR size");
    }
}

export async function getQrSize() {
    try {
        const qrSize = await AsyncStorage.getItem("qrsize");
        if (qrSize !== null) return parseFloat(qrSize);
        return qrSize;
    } catch {
        console.log("Error getting QR size");
    }
}

export async function setVolume(volume) {
    try {
        return await AsyncStorage.setItem("volume", volume);
    } catch {
        console.log("Error setting volume");
    }
}

export async function _getVolume() {
    try {
        const newVolume = await AsyncStorage.getItem("volume");
        return parseFloat(newVolume);
    } catch {
        console.log("Error getting volume");
    }
}

export async function setBrightness(brightness) {
    try {
        return await AsyncStorage.setItem("brightness", brightness);
    } catch {
        console.log("Error setting brightness");
    }
}

export async function getAllSettings() {
    try {
        return {
            volume: await _getVolume(),
            brightness: await _getBrightness(),
            mail: await getDoctorEmail(),
            pin: await getAdminPin(),
            targetLines: await getTargetLines(),
            qrsize: await getQrSize()
        };
    } catch {
        console.log("Error getting all settings");
    }
}

async function _getBrightness() {
    try {
        const newBrightness = await AsyncStorage.getItem("brightness");
        return parseFloat(newBrightness);
    } catch {
        console.log("Error getting brightness");
    }
}

export async function setAcuites(acuites) {
    try {
        return await AsyncStorage.setItem("acuites", JSON.stringify(acuites));
    } catch {
        console.log("Error setting acuites");
    }
}

export async function getAcuites() {
    try {
        return JSON.parse(await AsyncStorage.getItem("acuites"));
    } catch {
        console.log("Error getting acuites");
    }
}

export async function initDefault() {
    const targetLines = await getTargetLines();
    const qrSize = await getQrSize();
    const etdrsScale = await getAcuites();
    const mail = await getDoctorEmail();
    if (targetLines === null) await setTargetLines(defaultTargetLines);
    if (qrSize === null) await setQrSize(defaultQrSize);
    if (etdrsScale === null) await setAcuites(defaultEtdrsScale);
    if (mail === null) await setDoctorEmail("");
}