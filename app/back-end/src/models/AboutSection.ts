import mongoose, { Schema, Document } from 'mongoose';

// Interface para TypeScript
export interface IAboutHighlight {
  _id?: string;
  icon: string; // Clase de icono CSS (ej: "fas fa-laptop-code")
  title: string;
  descriptionHtml: string;
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
  aboutText: string; // Texto principal de la sección
  highlights: IAboutHighlight[];
  collaborationNote: {
    title: string;
    description: string;
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
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    descriptionHtml: {
      type: String,
      required: true,
      trim: true,
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
      type: String,
      required: true,
      trim: true,
    },
    highlights: [AboutHighlightSchema],
    collaborationNote: {
      title: {
        type: String,
        required: true,
        default: '¿Tienes un proyecto desafiante?',
      },
      description: {
        type: String,
        required: true,
        default:
          'Me especializo en transformar ideas complejas en soluciones digitales efectivas. Si buscas un desarrollador comprometido con la excelencia técnica, ¡conversemos sobre tu próximo proyecto!',
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
