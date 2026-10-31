import {it,expect} from 'vitest';
import {allowedOrigin} from '../src/appOrigin';
it.each(['https://printguard3d.roseandpaw.ca/','https://printguard3d.roseandpaw.ca/#Reports','http://127.0.0.1:4000/','http://localhost:4000/'])('O01 approved canonical or development origin %s',url=>expect(allowedOrigin(url)).toBe(true));
it.each(['http://printguard3d.roseandpaw.ca/','https://printguard3d.roseandpaw.ca:8443/','https://preview.pages.dev/','https://apps.roseandpaw.ca/printguard3d','https://example.chatgpt.site/','http://127.0.0.2:4000/'])('O02 unsupported alias does not initialize %s',url=>expect(allowedOrigin(url)).toBe(false));
