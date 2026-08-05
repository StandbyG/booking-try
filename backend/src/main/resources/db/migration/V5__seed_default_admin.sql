-- Usuario ADMIN por defecto para poder probar los endpoints de administracion
-- sin pasos manuales adicionales. Password: Admin123!
-- El registro publico (/api/v1/auth/register) siempre crea CLIENT; no hay
-- forma de auto-promocionarse a ADMIN via API.
INSERT INTO users (email, password_hash, full_name, role, enabled)
VALUES (
    'admin@booking.local',
    '$2a$10$UkQeyMMsWCOKZltJiSr7WO92eYdrdmztYrejEELT3kBTfOvLGntgC',
    'Admin',
    'ADMIN',
    true
);
