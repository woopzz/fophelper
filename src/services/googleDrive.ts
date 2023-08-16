import { GD_FILE_ID, GD_FOLDER_MIMETYPE, GD_ROOT_FOLDER_NAME, GD_PAYMENT_CSV_NAME } from '../data';

export function fetchBSLsCSV({ rootFolderId }: { rootFolderId: GD_FILE_ID }): Promise<GD_FILE_ID> {
    return new Promise((resolve, reject) => {
        const options = {
            q: `name = '${GD_PAYMENT_CSV_NAME}' and '${rootFolderId}' in parents`,
        };
        gapi.client.drive.files.list(options).then(
            (response) => {
                const files = response.result.files;
                console.debug('Found folders:', files);

                const fileId = files !== undefined && files.length > 0 && files[0].id;
                if (fileId) {
                    resolve(fileId);
                } else {
                    reject();
                }
            },
            (error) => {
                console.error(error);
                reject('Не вдається отримати інформацію про файл CSV з платежами з Google Drive. Спробуйте пізніше.');
            },
        );
    });
}

export function downloadFile({ fileId }: { fileId: GD_FILE_ID }): Promise<string> {
    return new Promise((resolve, reject) => {
        gapi.client.drive.files.get({ fileId, alt: 'media' }).then(
            (response) => {
                if ((response.status || 400) === 200) {
                    resolve(response.body);
                } else {
                    reject();
                }
            },
            (error) => {
                console.error(error);
                reject('Не вдається завантажити файл з Google Drive. Спробуйте пізніше.');
            },
        );
    });
}

export async function getOrCreateRootFolder(): Promise<GD_FILE_ID> {
    try {
        return await getRootFolder();
    } catch {
        return await createRootFolder();
    }
}

function getRootFolder(): Promise<GD_FILE_ID> {
    return new Promise((resolve, reject) => {
        const options = {
            q: 'mimeType = "application/vnd.google-apps.folder" and name = "woopzz/fophelper" and trashed = false and "root" in parents',
            fields: 'files(id)',
            spaces: 'drive',
        };
        gapi.client.drive.files.list(options).then(
            (response) => {
                const files = response.result.files;
                console.debug('Found folders:', files);

                const fileId = files !== undefined && files.length > 0 && files[0].id;
                if (fileId) {
                    resolve(fileId);
                } else {
                    reject();
                }
            },
            (error) => {
                console.error(error);
                reject('Не вдається отримати статус основної директорії на Google Drive. Спробуйте пізніше.');
            },
        );
    });
}

function createRootFolder(): Promise<GD_FILE_ID> {
    return new Promise((resolve, reject) => {
        const resource = {
            name: GD_ROOT_FOLDER_NAME,
            mimeType: GD_FOLDER_MIMETYPE,
        };
        const options = {
            resource,
            fields: 'id',
        };
        gapi.client.drive.files.create(options).then(
            (response) => {
                const file = response.result;
                console.debug('New file:', file);

                if (file.id !== undefined) {
                    resolve(file.id);
                } else {
                    reject(
                        'Директорія на Google Drive була створена, але інформація про неї невідома. Будь ласка, повідомте про це адміністратора.',
                    );
                }
            },
            (error) => {
                console.error(error);
                reject('Не вдається створити директорію на Google Drive. Спробуйте пізніше.');
            },
        );
    });
}
