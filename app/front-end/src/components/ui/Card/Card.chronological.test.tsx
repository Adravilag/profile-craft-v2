// [TEST] - Ejemplo de uso de Card para ChronologicalItem
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Card from '@/components/ui/Card/Card';
import SkillPill from '@/components/ui/SkillPill/SkillPill';

describe('Card - ChronologicalItem Example', () => {
  it('should render a chronological item using Card components', () => {
    const mockItem = {
      type: 'experience' as const,
      title: 'Integrador de Sistemas SCADA',
      company: 'ISOTROL',
      start_date: '2024-06',
      end_date: '2024-11',
      description:
        'Integración de sistemas y automatización de procesos en proyectos tecnológicos en el sector energético.',
      technologies: ['Azure', 'Microsoft Excel', 'Java', 'SVN'],
    };

    render(
      <Card className="chronological-card">
        <Card.Media>
          <img src="/images/isotrol.jpg" alt="ISOTROL" />
          <span className="period-badge">Jun 2024 - Nov 2024</span>
        </Card.Media>

        <Card.Header>
          <div className="type-badge">TRAYECTORIA PROFESIONAL</div>
          <h4>{mockItem.title}</h4>
          <p>
            <i className="fas fa-building" />
            <span>{mockItem.company}</span>
          </p>
        </Card.Header>

        <Card.Body>
          <div className="period">
            <i className="fas fa-calendar-alt" />
            <span>Jun 2024 - Nov 2024</span>
          </div>
          <div className="duration">
            <i className="fas fa-hourglass-half" />
            <span>5 meses</span>
          </div>
          <p>{mockItem.description}</p>
        </Card.Body>

        <Card.Tags>
          {mockItem.technologies.map((tech, idx) => (
            <SkillPill key={idx} name={tech} colored={true} />
          ))}
        </Card.Tags>
      </Card>
    );

    // Verificar que se renderiza correctamente
    expect(screen.getByText('Integrador de Sistemas SCADA')).toBeInTheDocument();
    expect(screen.getByText('ISOTROL')).toBeInTheDocument();
    expect(screen.getByText('TRAYECTORIA PROFESIONAL')).toBeInTheDocument();
    expect(screen.getByText(/Integración de sistemas/)).toBeInTheDocument();
    expect(screen.getByText('Azure')).toBeInTheDocument();
    expect(screen.getByText('Java')).toBeInTheDocument();
  });

  it('should render an education item using Card components', () => {
    const mockEducationItem = {
      type: 'education' as const,
      title: 'Ingeniería Informática',
      institution: 'Universidad de Granada',
      start_date: '2018-09',
      end_date: '2023-06',
      description: 'Grado en Ingeniería Informática con especialización en desarrollo de software.',
      grade: 'Notable',
    };

    render(
      <Card className="chronological-card education">
        <Card.Header>
          <div className="type-badge education">EDUCACIÓN</div>
          <h4>{mockEducationItem.title}</h4>
          <p>
            <i className="fas fa-university" />
            <span>{mockEducationItem.institution}</span>
          </p>
        </Card.Header>

        <Card.Body>
          <div className="period">
            <i className="fas fa-calendar-alt" />
            <span>Sep 2018 - Jun 2023</span>
          </div>
          <div className="duration">
            <i className="fas fa-hourglass-half" />
            <span>5 años</span>
          </div>
          <p>{mockEducationItem.description}</p>
        </Card.Body>

        <Card.Footer>
          <div className="grade">
            <i className="fas fa-medal" />
            <span>Calificación: {mockEducationItem.grade}</span>
          </div>
        </Card.Footer>
      </Card>
    );

    expect(screen.getByText('Ingeniería Informática')).toBeInTheDocument();
    expect(screen.getByText('Universidad de Granada')).toBeInTheDocument();
    expect(screen.getByText('EDUCACIÓN')).toBeInTheDocument();
    expect(screen.getByText(/Notable/)).toBeInTheDocument();
  });
});
