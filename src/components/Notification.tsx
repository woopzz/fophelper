import MUIAlert from '@mui/material/Alert';
import MUIIconButton from '@mui/material/IconButton';
import MUISnackbar from '@mui/material/Snackbar';
import MUICloseIcon from '@mui/icons-material/Close';

import { useAppDispatch, useAppSelector } from '../hooks/store';
import { dismissNotification } from '../slices/notification';

export const Notification = () => {
    const dispatch = useAppDispatch();
    const notification = useAppSelector((state) => state.notification.notification);

    if (!notification) {
        return null;
    }

    const handleClose = () => dispatch(dismissNotification());

    const action = (
        <MUIIconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
            <MUICloseIcon fontSize="small" />
        </MUIIconButton>
    );

    return (
        <MUISnackbar open={true}>
            <MUIAlert action={action} severity={notification.type}>
                {notification.message}
            </MUIAlert>
        </MUISnackbar>
    );
};
