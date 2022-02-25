import { StyleSheet } from "react-native";

export const colors = {
    DANGER: "#dc3545",
    SUCESS: "#28a745",
    PRIMARY: "#007bff",
    SECONDARY: "#6c757d",
    DISABLED: "#6c757d"
};

export const styles = StyleSheet.create({
    containers: {
        flexDirection: "column",
        marginVertical: 20,
        alignItems: "center",
        paddingHorizontal: 5
    },
    actionButtons: {
        borderWidth: 1,
        width: "100%",
        borderColor: "#007BFF",
        backgroundColor: "#007BFF",
        borderRadius: 5,
        marginTop: 7,
        marginHorizontal: 4,
        padding: 20
    },
    actionButtonsText: {
        color: "#FFFFFF",
        fontSize: 20,
        textAlign: "center"
    },
    headers: {
        fontSize: 22,
        paddingVertical: 5,
        fontWeight: "bold",
        textAlign: "center"
    },
    important: {
        fontSize: 18
    },
    inputs: {
        borderColor: "#CCCCCC",
        borderWidth: 1,
        borderRadius: 3,
        fontSize: 25,
        height: 50,
        paddingLeft: 5,
        paddingRight: 5,
        marginBottom: 6
    },
    get inputsDisabled() {
        return {
            ...this.inputs,
            backgroundColor: "#f5f5f5",
            textAlignVertical: "center"
        };
    },
    get inputViews() {
        return {
            ...this.inputs,
            textAlignVertical: "center"
        };
    },
    inputsLabels: {
        fontSize: 18,
        marginTop: 7
    }
});
