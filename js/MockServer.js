// Temporary server imitation for the demonstration of the form component features

export class MockServer {
    constructor() {
        this.registeredUsers = [
            { userEmail: 'orangehood@mindblowing.com', userPassword: '1111' },
            { userEmail: 'italianRaisin@strelna.ru', userPassword: '5372' }
        ];
    }

    async post(url, formData) {
        const delay = Math.floor(Math.random() * 1200) + 800;
        await new Promise(resolve => setTimeout(resolve, delay));

        // server-side error imitation
        if (Math.random() < 0.5) {
            return {
                ok: false,
                status: '503',
                error: 'NETWORK_ERROR',
                message: 'Service Temporarily Unavailable'
            }
        }

        // registration
        if (url === '/api/register') {
            return this._handleRegistration(formData);
        }

        return {
            ok: false,
            status: 404,
            error: 'NOT_FOUND',
            message: 'page not found'
        }
    }

    _handleRegistration(formData) {
        const email = formData.get('userEmail');
        const password = formData.get('userPassword');

        if (!email || !password) {
            return {
                ok: false,
                status: '400',
                error: 'BAD_REQUEST',
                message: 'Please specify a valid email address and password'
            }
        }

        const userExists = this.registeredUsers.some(u => u.userEmail === email);
        if (userExists) {
            return {
                ok: false,
                status: '409',
                error: 'EMAIL_ALREADY_TAKEN',
                message: 'Email already taken'
            };
        }

        const additionalFields = {};
        for (let [key, value] of formData.entries()) {
            additionalFields[key] = value;
        }

        console.log('--- backend accepted the data ---');
        this.registeredUsers.push({ email, password });

        return {
            ok: true,
            status: '201',
            message: 'Registration success'
        }
    }
}