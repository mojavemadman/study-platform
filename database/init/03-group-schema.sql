\c group_db;

CREATE TYPE invite_policy_type AS ENUM ('admin_only', 'all_members');
CREATE TYPE invitation_status_type AS ENUM ('pending', 'accepted', 'declined', 'expired');

CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_by INTEGER NOT NULL,
    invite_policy invite_policy_type DEFAULT 'admin_only',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE group_members (
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, user_id)
);

CREATE TABLE invitations (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    inviter_id INTEGER NOT NULL,
    invitee_email VARCHAR(255) NOT NULL,
    status invitation_status_type DEFAULT 'pending',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP 
);