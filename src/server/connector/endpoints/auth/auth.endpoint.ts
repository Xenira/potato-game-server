import { Endpoint } from '../../protocol';

const mockPW = 'abcdef';
const mockUN = 'lasse.sprengel@gmail.com';
export class AuthEndpoint extends Endpoint {
    execute(data: any, callback: (error: string, data?: any) => void) {
        if (!data.pw || !data.un || data.pw !== mockPW || data.un !== mockUN) {
            return callback("Authentification failed");
        }
        callback(null, {
            login: mockUN,
            name: 'xenira',
            exp: 0,
            gold: 20,
            tickets: 1,
            deck1: null,
            deck2: null,
            deck3: null
        });
    }
}