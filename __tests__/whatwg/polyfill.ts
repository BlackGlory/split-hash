import { Crypto } from '@peculiar/webcrypto'

globalThis.crypto = new Crypto() as globalThis.Crypto
