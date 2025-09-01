import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css'; // puedes crear estilos propios

const NotFoundPage: React.FC = () => {
  return (
    <main className={styles.notFound} role="alert">
      <section className={styles.container}>
        <h1 className={styles.title}>
          4<span className={styles.glow}>0</span>4
        </h1>
        <p className={styles.subtitle}>Oops! Página no encontrada</p>
        <p className={styles.description}>
          La página que buscas no existe o fue movida. Revisa la URL o vuelve al inicio.
        </p>
        <div className={styles.actions}>
          <Link to="/" className={styles.homeButton}>
            <i className="fas fa-home" aria-hidden="true" /> Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
};

export default NotFoundPage;
