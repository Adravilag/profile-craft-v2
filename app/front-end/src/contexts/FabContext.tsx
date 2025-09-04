import React from 'react';

type Handler = () => void;

type FabContextValue = {
  openTestimonialModal: () => void;
  openTestimonialsAdmin: () => void;
  openSkillModal: () => void;
  openExperienceModal: () => void;
  openExperienceAdmin: () => void;
  openAboutModal: () => void;
  onOpenTestimonialModal: (h: Handler) => () => void;
  onOpenTestimonialsAdmin: (h: Handler) => () => void;
  onOpenSkillModal: (h: Handler) => () => void;
  onOpenExperienceModal: (h: Handler) => () => void;
  onOpenExperienceAdmin: (h: Handler) => () => void;
  onOpenAboutModal: (h: Handler) => () => void;
};

const defaultValue: FabContextValue = {
  openTestimonialModal: () => undefined,
  openTestimonialsAdmin: () => undefined,
  openSkillModal: () => undefined,
  openExperienceModal: () => undefined,
  openExperienceAdmin: () => undefined,
  openAboutModal: () => undefined,
  onOpenTestimonialModal: () => () => undefined,
  onOpenTestimonialsAdmin: () => () => undefined,
  onOpenSkillModal: () => () => undefined,
  onOpenExperienceModal: () => () => undefined,
  onOpenExperienceAdmin: () => () => undefined,
  onOpenAboutModal: () => () => undefined,
};

const FabContext = React.createContext<FabContextValue>(defaultValue);

export const FabProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const testimonialHandlers = React.useRef<Handler[]>([]);
  const adminHandlers = React.useRef<Handler[]>([]);
  const skillHandlers = React.useRef<Handler[]>([]);
  const experienceHandlers = React.useRef<Handler[]>([]);
  const experienceAdminHandlers = React.useRef<Handler[]>([]);
  const aboutHandlers = React.useRef<Handler[]>([]);

  const openTestimonialModal = React.useCallback(() => {
    testimonialHandlers.current.forEach(h => h());
  }, []);

  const openTestimonialsAdmin = React.useCallback(() => {
    adminHandlers.current.forEach(h => h());
  }, []);

  const openSkillModal = React.useCallback(() => {
    skillHandlers.current.forEach(h => h());
  }, []);

  const openExperienceModal = React.useCallback(() => {
    // debug: indicate handlers count and call each
    try {
      console.debug(
        '[FabContext] openExperienceModal called, handlers=',
        experienceHandlers.current.length
      );
    } catch (e) {}
    experienceHandlers.current.forEach(h => {
      try {
        h();
      } catch (err) {
        try {
          console.error('[FabContext] handler error', err);
        } catch (e) {}
      }
    });
  }, []);

  const openExperienceAdmin = React.useCallback(() => {
    try {
      console.debug(
        '[FabContext] openExperienceAdmin called, handlers=',
        experienceAdminHandlers.current.length
      );
    } catch (e) {}
    experienceAdminHandlers.current.forEach(h => {
      try {
        h();
      } catch (err) {
        try {
          console.error('[FabContext] experienceAdmin handler error', err);
        } catch (e) {}
      }
    });
  }, []);

  const openAboutModal = React.useCallback(() => {
    try {
      console.debug('[FabContext] openAboutModal called, handlers=', aboutHandlers.current.length);
    } catch (e) {}
    aboutHandlers.current.forEach(h => {
      try {
        h();
      } catch (err) {
        try {
          console.error('[FabContext] about handler error', err);
        } catch (e) {}
      }
    });
  }, []);

  const onOpenTestimonialModal = React.useCallback((h: Handler) => {
    testimonialHandlers.current.push(h);
    return () => {
      testimonialHandlers.current = testimonialHandlers.current.filter(fn => fn !== h);
    };
  }, []);

  const onOpenTestimonialsAdmin = React.useCallback((h: Handler) => {
    adminHandlers.current.push(h);
    return () => {
      adminHandlers.current = adminHandlers.current.filter(fn => fn !== h);
    };
  }, []);

  const onOpenSkillModal = React.useCallback((h: Handler) => {
    skillHandlers.current.push(h);
    return () => {
      skillHandlers.current = skillHandlers.current.filter(fn => fn !== h);
    };
  }, []);

  const onOpenExperienceModal = React.useCallback((h: Handler) => {
    experienceHandlers.current.push(h);
    try {
      console.debug(
        '[FabContext] onOpenExperienceModal registered, total=',
        experienceHandlers.current.length
      );
    } catch (e) {}
    return () => {
      experienceHandlers.current = experienceHandlers.current.filter(fn => fn !== h);
      try {
        console.debug(
          '[FabContext] onOpenExperienceModal unregistered, total=',
          experienceHandlers.current.length
        );
      } catch (e) {}
    };
  }, []);

  const onOpenExperienceAdmin = React.useCallback((h: Handler) => {
    experienceAdminHandlers.current.push(h);
    try {
      console.debug(
        '[FabContext] onOpenExperienceAdmin registered, total=',
        experienceAdminHandlers.current.length
      );
    } catch (e) {}
    return () => {
      experienceAdminHandlers.current = experienceAdminHandlers.current.filter(fn => fn !== h);
      try {
        console.debug(
          '[FabContext] onOpenExperienceAdmin unregistered, total=',
          experienceAdminHandlers.current.length
        );
      } catch (e) {}
    };
  }, []);

  const onOpenAboutModal = React.useCallback((h: Handler) => {
    aboutHandlers.current.push(h);
    try {
      console.debug(
        '[FabContext] onOpenAboutModal registered, total=',
        aboutHandlers.current.length
      );
    } catch (e) {}
    return () => {
      aboutHandlers.current = aboutHandlers.current.filter(fn => fn !== h);
      try {
        console.debug(
          '[FabContext] onOpenAboutModal unregistered, total=',
          aboutHandlers.current.length
        );
      } catch (e) {}
    };
  }, []);

  return (
    <FabContext.Provider
      value={{
        openTestimonialModal,
        openTestimonialsAdmin,
        openSkillModal,
        openExperienceModal,
        openExperienceAdmin,
        openAboutModal,
        onOpenTestimonialModal,
        onOpenTestimonialsAdmin,
        onOpenSkillModal,
        onOpenExperienceModal,
        onOpenExperienceAdmin,
        onOpenAboutModal,
      }}
    >
      {children}
    </FabContext.Provider>
  );
};

export const useFab = () => React.useContext(FabContext);

export default FabContext;
