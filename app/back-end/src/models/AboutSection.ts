import mongoose, { Schema, Document } from 'mongoose';

// Interface para TypeScript
export interface ILocalizedString {
  es: string;
  en: string;
}

export interface IAboutHighlight {
  _id?: string;
  icon: string; // Clase de icono CSS (ej: "fas fa-laptop-code")
  title: ILocalizedString | string;
  descriptionHtml: ILocalizedString | string;
  tech: string;
  imageSrc: string; // URL de Cloudinary
  imageCloudinaryId: string; // ID de la imagen en Cloudinary para gestión
  order: number; // Para controlar el orden de visualización
  isActive: boolean; // Para activar/desactivar elementos
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface para la sección About completa
export interface IAboutSection extends Document {
  aboutText: ILocalizedString | string; // Texto principal de la sección (localizable)
  highlights: IAboutHighlight[];
  collaborationNote: {
    title: ILocalizedString | string;
    description: ILocalizedString | string;
    icon: string;
  };
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Schema para los highlights individuales
const AboutHighlightSchema = new Schema<IAboutHighlight>(
  {
    icon: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      // Support either a simple string (legacy) or an object { es, en }
      type: Schema.Types.Mixed,
      required: true,
    },
    descriptionHtml: {
      type: Schema.Types.Mixed,
      required: true,
    },
    tech: {
      type: String,
      required: true,
      trim: true,
    },
    imageSrc: {
      type: String,
      required: true,
      trim: true,
    },
    imageCloudinaryId: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Schema principal para la sección About
const AboutSectionSchema = new Schema<IAboutSection>(
  {
    aboutText: {
      // Can be a legacy string or an object { es, en }
      type: Schema.Types.Mixed,
      required: true,
      trim: true,
    },
    highlights: [AboutHighlightSchema],
    collaborationNote: {
      title: {
        type: Schema.Types.Mixed,
        required: true,
        default: {
          es: '¿Tienes un proyecto desafiante?',
          en: 'Got a challenging project?',
        },
      },
      description: {
        type: Schema.Types.Mixed,
        required: true,
        default: {
          es: 'Me especializo en transformar ideas complejas en soluciones digitales efectivas. Si buscas un desarrollador comprometido con la excelencia técnica, ¡conversemos sobre tu próximo proyecto!',
          en: "I specialize in turning complex ideas into effective digital solutions. If you are looking for a developer committed to technical excellence, let's talk about your next project!",
        },
      },
      icon: {
        type: String,
        default: '🤝',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'about-section', // Forzar nombre de colección singular con guion según convención del proyecto
  }
);

// Exportar los modelos
const AboutHighlightModel =
  mongoose.models.AboutHighlight ||
  mongoose.model<IAboutHighlight>('AboutHighlight', AboutHighlightSchema);
const AboutSectionModel =
  mongoose.models.AboutSection || mongoose.model<IAboutSection>('AboutSection', AboutSectionSchema);

export { AboutHighlightModel as AboutHighlight };
export default AboutSectionModel;
