/**
 * Format file size
 * @param bytes 
 * @returns 
 */
export function formatSize(bytes: number): string {
    if(bytes===0)
            return '0 Bytes';
    const k=1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = parseInt(String(Math.floor(Math.log(bytes) / Math.log(k))));
    return Math.round(bytes / Math.pow(k,i)) + ' ' + sizes[i];
}

export const generateUUID =()=> crypto.randomUUID();