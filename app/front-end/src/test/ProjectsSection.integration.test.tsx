// ProjectsSection.integration.test.tsx - Integration tests for the refactored ProjectsSection component

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ProjectsSection from '@/components/layout/Sections/Projects/ProjectsSection';
import { DataProvider } from '@/contexts/DataContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { TranslationProvider } from '@/contexts/TranslationContext';
import { ModalProvider } from '@/contexts/ModalContext';
import type { Project } from '@/types/api';

// Mock the endpoints
const mockGetProjects = vi.fn();
const mockGetUserProfile = vi.fn();
const mockGetExperiences = vi.fn();

vi.mock('@/services/endpoints', () => ({
  projects: {
    getProjects: (...args: any[]) => mockGetProjects(...args),
  },
  profile: {
    getUserProfile: (...args: any[]) => mockGetUserProfile(...args),
  },
  experiences: {
    getExperiences: (...args: any[]) => mockGetExperiences(...args),
  },
  auth: {},
  contact: {},
  skills: {},
  media: {},
  testimonials: {},
  certifications: {},
  education: {},
  about: {},
}));

// Mock the hooks individually to test their integration
const mockUseProjectsData = vi.fn();
const mockUsePagination = vi.fn();
const mockUseProjectsFilter = vi.fn();
const mockUseProjectMapper = vi.fn();
const mockUseProjectModal = vi.fn();

vi.mock('@/hooks', () => ({
  useProjectsData: (...args: any[]) => mockUseProjectsData(...args),
  usePagination: (...args: any[]) => mockUsePagination(...args),
  useProjectsFilter: (...args: any[]) => mockUseProjectsFilter(...args),
  useProjectMapper: (...args: any[]) => mockUseProjectMapper(...args),
  useProjectModal: (...args: any[]) => mockUseProjectModal(...args),
}));

// Mock the ProjectCard component to simplify testing
vi.mock('@/components/layout/Sections/Projects/components/ProjectCard/ProjectCard', () => ({
  default: ({ project }: { project: any }) => (
    <div data-testid={`project-card-${project.id}`}>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
    </div>
  ),
}));

// Mock react-router navigate to assert navigation when project is clicked
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the Pagination component
vi.mock('@/ui/components/layout/Pagination', () => ({
  default: ({ currentPage, totalPages, onPageChange }: any) => (
    <div data-testid="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        data-testid="prev-page"
      >
        Previous
      </button>
      <span data-testid="page-info">
        {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        data-testid="next-page"
      >
        Next
      </button>
    </div>
  ),
}));

// Mock HeaderSection component
vi.mock('@/components/layout/Sections/HeaderSection/HeaderSection', () => ({
  default: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div data-testid="header-section">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  ),
}));

// Sample test data
const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Project One',
    description: 'First test project',
    type: 'proyecto',
    technologies: ['React', 'TypeScript'],
    image_url: 'https://example.com/image1.jpg',
    github_url: 'https://github.com/test/project1',
    live_url: 'https://project1.com',
  },
  {
    id: '2',
    title: 'Project Two',
    description: 'Second test project',
    type: 'proyecto',
    technologies: ['Vue', 'JavaScript'],
    image_url: 'https://example.com/image2.jpg',
    github_url: 'https://github.com/test/project2',
  },
  {
    id: '3',
    title: 'Article One',
    description: 'First test article',
    type: 'articulo',
    technologies: ['Writing'],
    image_url: 'https://example.com/article1.jpg',
  },
  {
    id: '4',
    title: 'Project Three',
    description: 'Third test project',
    type: 'proyecto',
    technologies: ['Angular', 'TypeScript'],
    image_url: 'https://example.com/image3.jpg',
  },
];

// Wrapper with all necessary providers
const AllProvidersWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <TranslationProvider>
      <AuthProvider>
        <DataProvider>
          <ModalProvider>{children}</ModalProvider>
        </DataProvider>
      </AuthProvider>
    </TranslationProvider>
  </BrowserRouter>
);

describe('[INTEGRATION] ProjectsSection Component', () => {
  const mockMapItemToProject = vi.fn();
  const mockHandlePageChange = vi.fn();
  const mockSetFilter = vi.fn();
  const mockOpenModal = vi.fn();
  const mockCloseModal = vi.fn();
  const mockRetry = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default endpoint mocks
    mockGetProjects.mockResolvedValue(mockProjects);
    mockGetUserProfile.mockResolvedValue({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    });
    mockGetExperiences.mockResolvedValue([]);

    // Setup default mock implementations
    mockUseProjectsData.mockReturnValue({
      projects: mockProjects,
      loading: false,
      error: null,
      retry: mockRetry,
    });

    mockUsePagination.mockReturnValue({
      currentPage: 1,
      totalPages: 2,
      paginatedItems: vi.fn(items => items.slice(0, 3)), // First 3 items
      handlePageChange: mockHandlePageChange,
      isChangingPage: false,
    });

    mockUseProjectsFilter.mockReturnValue({
      selectedFilter: 'all',
      filteredProjects: mockProjects,
      setFilter: mockSetFilter,
      showFilters: true,
    });

    mockUseProjectMapper.mockReturnValue({
      mapItemToProject: mockMapItemToProject,
    });

    mockUseProjectModal.mockReturnValue({
      activeProject: null,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
    });

    // Setup mapItemToProject to return the same project with UI format
    mockMapItemToProject.mockImplementation(project => ({
      ...project,
      id: String(project.id),
      title: project.title || project.name || 'Untitled',
      description: project.description || 'No description',
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('🟢 Data Loading and Display', () => {
    it('should display projects when data is loaded successfully', async () => {
      render(
        <AllProvidersWrapper>
          <ProjectsSection />
        </AllProvidersWrapper>
      );

      // Should show header
      expect(screen.getByText('Proyectos')).toBeInTheDocument();

      // Should show filter buttons
      expect(screen.getByText('Show All')).toBeInTheDocument();
      expect(screen.getByText('Projects')).toBeInTheDocument();

      // Should show project cards
      await waitFor(() => {
        expect(screen.getByTestId('project-card-1')).toBeInTheDocument();
        expect(screen.getByTestId('project-card-2')).toBeInTheDocument();
        expect(screen.getByTestId('project-card-3')).toBeInTheDocument();
      });

      // Should show pagination (top and bottom)
      const paginations = screen.getAllByTestId('pagination');
      expect(paginations.length).toBeGreaterThanOrEqual(1);
      const pageInfos = screen.getAllByTestId('page-info');
      expect(pageInfos[0]).toHaveTextContent('1 of 2');
    });

    it('should display loading state correctly', () => {
      mockUseProjectsData.mockReturnValue({
        projects: [],
        loading: true,
        error: null,
        retry: mockRetry,
      });

      render(
        <AllProvidersWrapper>
          <ProjectsSection />
        </AllProvidersWrapper>
      );

      // Should show skeleton loading cards
      const skeletonCards = screen
        .getAllByRole('generic')
        .filter(el => el.className.includes('projectCardSkeleton'));
      expect(skeletonCards).toHaveLength(3); // articlesPerPage = 3
    });

    it('should display error state with retry functionality', async () => {
      const user = userEvent.setup();
      mockUseProjectsData.mockReturnValue({
        projects: [],
        loading: false,
        error: 'Failed to load projects',
        retry: mockRetry,
      });

      render(
        <AllProvidersWrapper>
          <ProjectsSection />
        </AllProvidersWrapper>
      );

      // Should show error message
      expect(screen.getByText('Failed to load projects')).toBeInTheDocument();

      // Should show retry button
      const retryButton = screen.getByText('Retry');
      expect(retryButton).toBeInTheDocument();

      // Should call retry when button is clicked
      await user.click(retryButton);
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('should display empty state when no projects are available', () => {
      mockUseProjectsData.mockReturnValue({
        projects: [],
        loading: false,
        error: null,
        retry: mockRetry,
      });

      mockUseProjectsFilter.mockReturnValue({
        selectedFilter: 'all',
        filteredProjects: [],
        setFilter: mockSetFilter,
        showFilters: false,
      });

      render(
        <AllProvidersWrapper>
          <ProjectsSection />
        </AllProvidersWrapper>
      );

      // Should show empty state message
      expect(screen.getByText('No projects to show')).toBeInTheDocument();
    });
  });

  describe('🟢 Hook Integration and Data Flow', () => {
    it('should pass correct data between hooks', () => {
      render(
        <AllProvidersWrapper>
          <ProjectsSection />
        </AllProvidersWrapper>
      );

      // Verify useProjectsData was called
      expect(mockUseProjectsData).toHaveBeenCalled();

      // Verify useProjectsFilter was called with projects from useProjectsData
      expect(mockUseProjectsFilter).toHaveBeenCalledWith(
        mockProjects,
        expect.objectContaining({
          onFilterChange: expect.any(Function),
        })
      );

      // Verify usePagination was called with filtered projects length
      expect(mockUsePagination).toHaveBeenCalledWith({
        totalItems: mockProjects.length,
        itemsPerPage: 3,
        initialPage: 1,
      });

      // Verify useProjectMapper was called
      expect(mockUseProjectMapper).toHaveBeenCalled();

      // Verify useProjectModal is not used by this component anymore
      expect(mockUseProjectModal).not.toHaveBeenCalled();
    });

    it('should call mapItemToProject for each displayed project', async () => {
      render(
        <AllProvidersWrapper>
          <ProjectsSection />
        </AllProvidersWrapper>
      );

      await waitFor(() => {
        // Should call mapItemToProject for each project in the paginated results
        expect(mockMapItemToProject).toHaveBeenCalledTimes(3); // First 3 projects
        expect(mockMapItemToProject).toHaveBeenCalledWith(mockProjects[0]);
        expect(mockMapItemToProject).toHaveBeenCalledWith(mockProjects[1]);
        expect(mockMapItemToProject).toHaveBeenCalledWith(mockProjects[2]);
      });
    });
  });

  describe('🟢 Filtering Functionality', () => {
    it('should handle filter changes correctly', async () => {
      const user = userEvent.setup();

      render(
        <AllProvidersWrapper>
          <ProjectsSection />
        </AllProvidersWrapper>
      );

      // Click on 'projects' filter
      const projectsFilter = screen.getByText('Projects');
      await user.click(projectsFilter);

      // Should call setFilter with 'projects'
      expect(mockSetFilter).toHaveBeenCalledWith('projects');
    });

    it('should show/hide filters based on showFilters flag', () => {
      // Test with filters shown
      render(
        <AllProvidersWrapper>
          <ProjectsSection />
        </AllProvidersWrapper>
      );

      expect(screen.getByText('Show All')).toBeInTheDocument();
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });

    it('should hide filters when showFilters is false', () => {
      // Test with filters hidden
      mockUseProjectsFilter.mockReturnValue({
        selectedFilter: 'all',
        filteredProjects: mockProjects,
        setFilter: mockSetFilter,
        showFilters: false,
      });

      render(
        <AllProvidersWrapper>
          <ProjectsSection />
        </AllProvidersWrapper>
      );

      expect(screen.queryByText('Show All')).not.toBeInTheDocument();
      expect(screen.queryByText('Projects')).not.toBeInTheDocument();
    });

    it('should display active filter state correctly', () => {
      mockUseProjectsFilter.mockReturnValue({
        selectedFilter: 'projects',
        filteredProjects: mockProjects.filter(p => p.type === 'proyecto'),
        setFilter: mockSetFilter,
        showFilters: true,
      });

      render(
        <AllProvidersWrapper>
          <ProjectsSection />
        </AllProvidersWrapper>
      );

      const allFilter = screen.getByText('Show All');
      const projectsFilter = screen.getByText('Projects');

      // 'All' should not have active class, 'Projects' should have active class
      expect(allFilter.closest('button')).not.toHaveClass('_active_8676f3');
      expect(projectsFilter.closest('button')).toHaveClass('_active_8676f3');
    });
  });

  describe('🟢 Pagination Functionality', () => {
    it('should handle page changes correctly', async () => {
      const user = userEvent.setup();

      render(
        <AllProvidersWrapper>
          <ProjectsSection />
        </AllProvidersWrapper>
      );

      // Click next page button (top pagination)
      const nextButtons = screen.getAllByTestId('next-page');
      await user.click(nextButtons[0]);

      // Should call handlePageChange with page 2
      expect(mockHandlePageChange).toHaveBeenCalledWith(2);
    });

    it('should show pagination only when there are multiple pages', () => {
      // Test with multiple pages
      render(
        <AllProvidersWrapper>
          <ProjectsSection />
        </AllProvidersWrapper>
      );

      expect(screen.getAllByTestId('pagination').length).toBeGreaterThanOrEqual(1);
    });

    it('should hide pagination when there is only one page', () => {
      // Test with single page
      mockUsePagination.mockReturnValue({
        currentPage: 1,
        totalPages: 1,
        paginatedItems: vi.fn(items => items),
        handlePageChange: mockHandlePageChange,
        isChangingPage: false,
      });

      render(
        <AllProvidersWrapper>
          <ProjectsSection />
        </AllProvidersWrapper>
      );

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('should show loading state during page changes', () => {
      mockUsePagination.mockReturnValue({
        currentPage: 1,
        totalPages: 2,
        paginatedItems: vi.fn(items => items.slice(0, 3)),
        handlePageChange: mockHandlePageChange,
        isChangingPage: true, // Loading state
      });

      render(
        <AllProvidersWrapper>
          <ProjectsSection />
        </AllProvidersWrapper>
      );

      // Should apply loading class to projects grid
      const projectsGrid = screen.getByTestId('projects-grid');
      expect(projectsGrid).toHaveClass('_loading_8676f3');
    });
  });

  describe('🟢 Modal Functionality', () => {
    it('should navigate to project page when project is clicked', async () => {
      const user = userEvent.setup();

      render(
        <AllProvidersWrapper>
          <ProjectsSection />
        </AllProvidersWrapper>
      );

      // Click on first project card
      const projectCard = screen.getByTestId('project-card-1');
      await user.click(projectCard);

      // Should navigate to project page
      expect(mockNavigate).toHaveBeenCalledWith('/project/1');
    });

    it('should handle keyboard navigation for project cards and navigate', async () => {
      const user = userEvent.setup();

      render(
        <AllProvidersWrapper>
          <ProjectsSection />
        </AllProvidersWrapper>
      );

      // Find the project card container (the clickable element)
      const projectCardContainers = screen.getAllByRole('button');
      const firstProjectContainer = projectCardContainers.find(container =>
        container.querySelector('[data-testid="project-card-1"]')
      );

      expect(firstProjectContainer).toBeDefined();

      // Focus and press Enter
      if (firstProjectContainer) {
        firstProjectContainer.focus();
        await user.keyboard('{Enter}');

        expect(mockNavigate).toHaveBeenCalledWith('/project/1');

        // Test Space key
        vi.clearAllMocks();
        await user.keyboard(' ');

        expect(mockNavigate).toHaveBeenCalledWith('/project/1');
      }
    });

    it('should call onProjectClick prop when provided instead of opening modal', async () => {
      const user = userEvent.setup();
      const mockOnProjectClick = vi.fn();

      render(
        <AllProvidersWrapper>
          <ProjectsSection onProjectClick={mockOnProjectClick} />
        </AllProvidersWrapper>
      );

      // Click on first project card
      const projectCard = screen.getByTestId('project-card-1');
      await user.click(projectCard);

      // Should call onProjectClick instead of openModal
      expect(mockOnProjectClick).toHaveBeenCalledWith('1');
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('🟢 Error States and Loading States Integration', () => {
    it('should handle multiple error states from different hooks', () => {
      // Test data loading error
      mockUseProjectsData.mockReturnValue({
        projects: [],
        loading: false,
        error: 'Network error',
        retry: mockRetry,
      });

      render(
        <AllProvidersWrapper>
          <ProjectsSection />
        </AllProvidersWrapper>
      );

      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should handle loading states from multiple hooks', () => {
      // Test data loading
      mockUseProjectsData.mockReturnValue({
        projects: [],
        loading: true,
        error: null,
        retry: mockRetry,
      });

      render(
        <AllProvidersWrapper>
          <ProjectsSection />
        </AllProvidersWrapper>
      );

      // Should show loading skeletons
      const skeletonCards = screen
        .getAllByRole('generic')
        .filter(el => el.className.includes('projectCardSkeleton'));
      expect(skeletonCards).toHaveLength(3);
    });

    it('should handle pagination loading state correctly', () => {
      mockUsePagination.mockReturnValue({
        currentPage: 2,
        totalPages: 2,
        paginatedItems: vi.fn(items => items.slice(3, 6)),
        handlePageChange: mockHandlePageChange,
        isChangingPage: true,
      });

      render(
        <AllProvidersWrapper>
          <ProjectsSection />
        </AllProvidersWrapper>
      );

      // Should show loading class on projects grid
      const projectsGrid = screen.getByTestId('projects-grid');
      expect(projectsGrid).toHaveClass('_loading_8676f3');
    });
  });

  describe('🟢 Component Integration Edge Cases', () => {
    it('should handle empty filtered results correctly', () => {
      mockUseProjectsFilter.mockReturnValue({
        selectedFilter: 'projects',
        filteredProjects: [], // No projects match filter
        setFilter: mockSetFilter,
        showFilters: true,
      });

      mockUsePagination.mockReturnValue({
        currentPage: 1,
        totalPages: 0,
        paginatedItems: vi.fn(() => []),
        handlePageChange: mockHandlePageChange,
        isChangingPage: false,
      });

      render(
        <AllProvidersWrapper>
          <ProjectsSection />
        </AllProvidersWrapper>
      );

      // Should show empty projects grid (no project cards)
      const projectsGrid = screen.getByTestId('projects-grid');
      expect(projectsGrid).toBeEmptyDOMElement();
      // Should not show pagination
      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
    });

    it('should handle filter changes that affect pagination', async () => {
      const user = userEvent.setup();

      // Start with page 2 of all projects
      mockUsePagination.mockReturnValue({
        currentPage: 2,
        totalPages: 2,
        paginatedItems: vi.fn(items => items.slice(3)),
        handlePageChange: mockHandlePageChange,
        isChangingPage: false,
      });

      render(
        <AllProvidersWrapper>
          <ProjectsSection />
        </AllProvidersWrapper>
      );

      // Change filter to 'projects' which might have fewer results
      const projectsFilter = screen.getByText('Projects');
      await user.click(projectsFilter);

      expect(mockSetFilter).toHaveBeenCalledWith('projects');
      // Pagination should automatically adjust due to totalItems change
    });

    it('should maintain accessibility attributes correctly', () => {
      render(
        <AllProvidersWrapper>
          <ProjectsSection />
        </AllProvidersWrapper>
      );

      // Check filter buttons have proper aria attributes
      const allFilter = screen.getByText('Show All');
      const projectsFilter = screen.getByText('Projects');

      expect(allFilter.closest('button')).toHaveAttribute('aria-pressed', 'true');
      expect(projectsFilter.closest('button')).toHaveAttribute('aria-pressed', 'false');

      // Check project cards have proper role and tabindex
      const projectCards = screen.getAllByRole('button');
      const projectCard = projectCards.find(card =>
        card.querySelector('[data-testid="project-card-1"]')
      );

      if (projectCard) {
        expect(projectCard).toHaveAttribute('tabIndex', '0');
      }
    });
  });
});
