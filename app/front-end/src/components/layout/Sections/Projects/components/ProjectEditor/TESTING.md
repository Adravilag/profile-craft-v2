# ProjectEditor Testing Documentation

This document outlines the comprehensive testing strategy implemented for the ProjectEditor component as part of task 8 in the project-editor-refactor specification.

## Overview

The ProjectEditor component has been equipped with comprehensive integration and visual regression tests to ensure reliability, maintainability, and consistent user experience across different browsers, devices, and states.

## Test Structure

### 1. Integration Tests (`ProjectEditor.integration.test.tsx`)

Comprehensive integration tests covering the complete editor workflow:

#### Test Categories:

- **Component Rendering**: Basic component structure and element presence
- **Mode Switching**: HTML, Markdown, Preview, and Split view modes
- **Toolbar Functionality**: Format buttons, media library, external preview
- **Status Bar**: Content statistics and keyboard shortcuts
- **Accessibility**: ARIA labels, keyboard navigation, focus management
- **CSS Classes**: BEM methodology compliance and responsive classes

#### Key Test Scenarios:

1. **Complete Editor Workflow**:
   - Edit content → Switch to preview → Verify content preservation
   - Mode switching with content conversion
   - Split view functionality

2. **Media Insertion Workflow**:
   - Open media library → Select media → Insert into content
   - Different media types (image, video, file)
   - Media library state management

3. **External Preview Synchronization**:
   - Open external preview window
   - Real-time content synchronization
   - Window state management

4. **Content Conversion Integration**:
   - HTML ↔ Markdown conversion
   - Content preservation during mode switches
   - Error handling for conversion failures

5. **Responsive Design Integration**:
   - CSS class application for different modes
   - Preview container visibility logic
   - Mobile-first responsive behavior

### 2. Visual Regression Tests (`ProjectEditor.visual.test.tsx`)

Storybook-based visual regression tests using snapshot testing:

#### Test Categories:

- **Basic Rendering**: Default, empty, and content states
- **Mode-Specific Rendering**: All editor modes with proper styling
- **Responsive Design**: Mobile, tablet, desktop viewports
- **Content Variations**: Short, medium, long, and performance test content
- **Theme Variations**: Dark theme compatibility
- **Accessibility States**: Focus indicators and ARIA compliance
- **Error States**: Error handling and edge cases

#### Snapshot Coverage:

- 30+ visual snapshots covering all component states
- Responsive design across 4 viewport sizes
- All editor modes (HTML, Markdown, Preview, Split views)
- Content length variations
- Accessibility and error states

### 3. Chromatic Visual Tests (`ProjectEditor.chromatic.test.tsx`)

Specialized tests for Chromatic visual regression platform:

#### Test Categories:

- **Base States**: Empty, basic content, complex content
- **Editor Modes**: All modes with proper mock setup
- **External Preview States**: Open/closed states
- **Content Length Variations**: Performance testing with large content
- **Toolbar States**: HTML and Markdown toolbars
- **Status Bar Variations**: Empty and populated states
- **Preview Content Variations**: Different content types and conversions
- **Responsive Breakpoints**: 4 different screen sizes
- **Focus and Interaction States**: User interaction scenarios
- **Error and Edge Cases**: Malformed content, special characters
- **Accessibility Visual States**: Focus indicators, ARIA attributes

### 4. Storybook Stories (`ProjectEditor.stories.tsx`)

Comprehensive Storybook stories for component documentation and testing:

#### Story Categories:

- **Basic States**: Default, empty, with content
- **Mode-Specific Stories**: Each editor mode with appropriate content
- **Responsive Stories**: Mobile and tablet optimized views
- **Accessibility Stories**: Keyboard navigation and screen reader support
- **Error States**: Error handling demonstrations
- **Performance Stories**: Large content performance testing
- **Theme Stories**: Dark theme compatibility

## Test Configuration

### Chromatic Configuration (`chromatic.config.js`)

Advanced configuration for visual regression testing:

- **Multi-browser testing**: Chrome, Firefox, Safari, Edge
- **Responsive viewports**: 4 different screen sizes
- **Performance thresholds**: Render time and interaction delays
- **Accessibility rules**: Color contrast, keyboard navigation, ARIA
- **CI/CD integration**: GitHub Actions, status checks, PR comments
- **Notification system**: Slack and email notifications

## Running Tests

### Integration Tests

```bash
# Run all integration tests
npm run test -- --run src/components/layout/Sections/Projects/components/ProjectEditor/ProjectEditor.integration.test.tsx

# Run with coverage
npm run test:cov -- src/components/layout/Sections/Projects/components/ProjectEditor/ProjectEditor.integration.test.tsx
```

### Visual Regression Tests

```bash
# Run visual tests
npm run test -- --run src/components/layout/Sections/Projects/components/ProjectEditor/ProjectEditor.visual.test.tsx

# Update snapshots
npm run test -- --run src/components/layout/Sections/Projects/components/ProjectEditor/ProjectEditor.visual.test.tsx -u
```

### Chromatic Tests

```bash
# Run Chromatic tests
npm run test -- --run src/components/layout/Sections/Projects/components/ProjectEditor/ProjectEditor.chromatic.test.tsx

# Run Storybook for visual testing
npm run storybook
```

### Storybook Stories

```bash
# Start Storybook development server
npm run storybook

# Build Storybook for production
npm run build-storybook
```

## Test Coverage

### Functional Coverage:

- ✅ All editor modes (HTML, Markdown, Preview, Split views)
- ✅ Content conversion between formats
- ✅ Toolbar functionality (formatting, headers, lists)
- ✅ Media library integration
- ✅ External preview synchronization
- ✅ Keyboard shortcuts and accessibility
- ✅ Responsive design behavior
- ✅ Error handling and edge cases

### Visual Coverage:

- ✅ 30+ visual snapshots
- ✅ 4 responsive breakpoints
- ✅ All component states and modes
- ✅ Accessibility visual indicators
- ✅ Theme compatibility
- ✅ Error and loading states

### Browser Coverage:

- ✅ Chrome (primary)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

### Device Coverage:

- ✅ Mobile (375px)
- ✅ Tablet (768px)
- ✅ Desktop (1024px)
- ✅ Large Desktop (1440px+)

## Accessibility Testing

### Automated Accessibility Tests:

- ARIA labels and roles verification
- Keyboard navigation testing
- Focus management validation
- Color contrast compliance
- Screen reader compatibility

### Manual Accessibility Checklist:

- [ ] Tab navigation through all interactive elements
- [ ] Screen reader announces all content and state changes
- [ ] Keyboard shortcuts work as expected
- [ ] Focus indicators are clearly visible
- [ ] Color contrast meets WCAG 2.1 AA standards

## Performance Testing

### Performance Metrics:

- Component render time < 1000ms
- Interaction response time < 300ms
- Large content handling (1000+ lines)
- Memory usage optimization
- Bundle size impact

### Performance Test Scenarios:

- Large document editing (50+ sections)
- Rapid mode switching
- Real-time preview updates
- Media library with many items
- External preview synchronization

## Continuous Integration

### GitHub Actions Integration:

- Automated test execution on PR creation
- Visual regression testing with Chromatic
- Accessibility testing with axe-core
- Performance regression detection
- Cross-browser compatibility checks

### Quality Gates:

- All integration tests must pass
- Visual changes must be approved
- Accessibility score > 95%
- Performance regression < 10%
- Code coverage > 90%

## Maintenance

### Regular Maintenance Tasks:

- Update visual snapshots when design changes
- Review and update accessibility tests
- Performance benchmark updates
- Browser compatibility matrix updates
- Test documentation updates

### Troubleshooting:

- **Snapshot mismatches**: Review changes and update if intentional
- **Flaky tests**: Add proper wait conditions and mock stability
- **Performance issues**: Profile and optimize heavy operations
- **Accessibility failures**: Review ARIA implementation and keyboard navigation

## Future Enhancements

### Planned Improvements:

- E2E testing with Playwright
- Visual regression testing in CI/CD pipeline
- Automated accessibility scanning
- Performance monitoring integration
- Cross-platform testing expansion

This comprehensive testing strategy ensures the ProjectEditor component maintains high quality, accessibility, and performance standards while providing confidence for future development and refactoring efforts.
