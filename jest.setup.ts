import { TextDecoder, TextEncoder } from "util";
import "@testing-library/jest-native/extend-expect";

Object.assign(global, { TextDecoder, TextEncoder });
