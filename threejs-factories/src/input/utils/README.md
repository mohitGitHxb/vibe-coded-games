# Input Utils

This directory contains utility functions and helper classes for input handling.

## Purpose

The utils directory is reserved for:

- Input processing utilities
- Coordinate conversion helpers
- Input validation functions
- Performance optimization utilities
- Cross-browser compatibility helpers

## Future Utilities

Potential utilities that could be added:

- `InputRecorder` - Record and playback input sequences
- `InputMapper` - Map raw input to game actions
- `GestureRecognizer` - Recognize complex input patterns
- `InputFilters` - Apply filters to input (smoothing, deadzone, etc.)
- `KeyboardLayoutDetector` - Detect and adapt to different keyboard layouts

## Usage

```typescript
// Example of how utils might be used
import { InputRecorder, InputMapper } from "./utils/InputRecorder.js";

const recorder = new InputRecorder();
const mapper = new InputMapper();
```

## Contributing

When adding new utilities:

1. Keep them focused and single-purpose
2. Include comprehensive TypeScript types
3. Add JSDoc documentation
4. Include usage examples
5. Follow the existing code style
