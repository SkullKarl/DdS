import { Platform } from 'react-native';

// Platform-specific imports
const Map = Platform.select({
    native: () => require('./map.native').default,
    web: () => require('./map.web').default,
    default: () => require('./map.web').default,
})();

export default Map;