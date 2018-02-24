class User {
    constructor(user) {
        this.id = user.id;
        this.username = user.username;
        this.role = user.role;
    }

    isAdmin() {
        return this.role === 'ADMIN';
    }

    isModerator() {
        return this.role === 'ADMIN' || this.role === 'MODERATOR';
    }
}

module.exports = User;
