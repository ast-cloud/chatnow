import {atom} from 'recoil';

export const chatMessages = atom({
    key: 'chatMessages',
    default: []
});