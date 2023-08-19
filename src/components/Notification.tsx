import { IconButton, Snackbar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

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
        <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
            <CloseIcon fontSize="small" />
        </IconButton>
    );

    return <Snackbar open={true} message={notification.message} action={action} />;
};
