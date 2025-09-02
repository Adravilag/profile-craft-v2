import { render, screen } from '@testing-library/react';
import Marker from './Marker';

describe('Marker component', () => {
  it('should render without crashing', () => {
    render(<Marker />);
    const markerElement = screen.getByTestId('marker-component');
    expect(markerElement).toBeInTheDocument();
  });
});
