export const retry = async function<T>(
    delegate: () => Promise<T>,
    maxRetries: number,
): Promise<T> {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await delegate();
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError;
};
