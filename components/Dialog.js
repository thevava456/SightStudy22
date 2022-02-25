import React, { Component } from 'react'
import DialogInput from 'react-native-dialog-input';
import { getAdminPin } from '../src/utils/asyncFunctions';
import { showAlert } from '../src/utils/config';
import { withNavigation } from '@react-navigation/compat';

class Dialog extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isDialogVisible: false,
        };
    }


    componentWillUnmount() {
        const { onClose } = this.props;
        onClose();
    }

    async goToSettings(value) {
        const {
            onClose,
            navigation: { navigate }
        } = this.props;
        const pin = await getAdminPin()
        if (pin === null || pin === value) {
            onClose();
            navigate("SetUser");
        } else {
            onClose();
            showAlert("Mauvais code PIN");
        }
    }

    openDialog() {
        this.setState({ isDialogVisible: true });
    }

    hideDialog() {
        this.setState({ isDialogVisible: false });
    }

    render() {
        const { isDialogVisible, onClose } = this.props;
        return (
            <DialogInput
                isDialogVisible={isDialogVisible}
                title={"Accès aux réglages"}
                message={"Entrer le code PIN"}
                hintInput={"####"}
                submitInput={inputText => {
                    this.goToSettings(inputText);
                }}
                closeDialog={() => onClose()}
            ></DialogInput>
        )
    }
}
export default withNavigation(Dialog);
