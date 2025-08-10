const { ApiClient, ClientCredentialsAuthProvider } = require("twitch");
const { con } = require("../functions/dbConnection");

const clientId = "zrkh9ngbqbz72vhrntwn4xlrwkx3yr";
const clientSecret = "9x4csejrpirydnnfnubpbmpdp8h45z";
const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
const apiClient = new ApiClient({ authProvider });

const monitors = [];

class Monitor {
    constructor(username, gid, con) {
        this.name = username;
        this.con = con;
        this.gid = gid;
        this.isLive = false;
        this.callbackLive = undefined;
        this.callbackStop = undefined;
        this.user = undefined;
        this.stream = undefined;
        this.timer = undefined;
        this.invalid_user = false;
        this.stopped = false;

        //console.log(`started monitor for ${username} in gid ${gid} and pushed`);
        monitors.push(this);
    }

    async start() {
        await this.getUser();
        if (this.invalid_user) {
            monitors.splice(monitors.indexOf(this), 1);
            return "INVALID";
        }
        await this.getStream();

        // INITIAL REFRESH
        setTimeout(() => {
            this.refresh();
        }, 5000);

        const timer = setInterval(async () => {
            con.query(`SELECT * FROM serverTwitch WHERE guildId="${this.gid}"`, async (e, rows) => {
                if ((rows && rows.length > 0 && rows[0].receivingAlerts == "no") || this.stopped) return clearInterval(timer);
                await this.refresh();
            });
        }, 80000);
    }

    stop() {
        //console.log(`Stopped monitor for ${this.user?.name == undefined ? "no username" : this.user.name}`);
        this.stopped = true;
    }

    async getUser() {
        const user = await apiClient.helix.users.getUserByName(this.name);
        if (!user || user == null) {
            return this.invalid_user = true;
        }
        this.user = user;
    }

    async getStream() {
        const getStream = await apiClient.helix.streams.getStreamByUserId(this.user.id);
        if (!getStream || getStream == null) return;
        this.stream = getStream;
    }

    async isStreamLive() {
        return await apiClient.helix.streams.getStreamByUserId(this.user.id) !== null;
    }

    async refresh() {
        this.isLive = await this.isStreamLive(this.name);
        await this.handleCallbackLive();
    }

    async handleCallbackLive() {
        this.con.query(`SELECT * FROM streams WHERE userId="${this.user.id}"`, async (e, rows) => {
            if (!rows || rows.length == 0) {
                if (this.isLive) {
                    //console.log(`${this.name} is live and not added to the table, adding them.`);

                    const stream = await apiClient.helix.streams.getStreamByUserId(this.user.id);
                    if (!stream || stream == null) return;
                    this.callbackLive(stream, this.user);
                    this.con.query(`INSERT INTO streams (userId) VALUES (?)`, this.user.id);
                }
            } else {
                // console.log(`${this.name} is already added in the table, not sending message`)
                if (!this.isLive) {
                    // console.log(`${this.name} is already in the table and they're also not live, removing them from table`)
                    this.con.query(`DELETE FROM streams WHERE userId="${this.user.id}"`);
                }
            }
        });
    }

    onLive(callback) {
        this.callbackLive = callback;
    }

    async calcDiffDates() {
        const date1 = new Date();
        const date2 = (await apiClient.helix.streams.getStreamByUserId(this.user.id)).startDate;
        const diffTime = Math.abs(date1 - date2);
        return diffTime;
    }
}

module.exports = Monitor;
module.exports.client = apiClient;
module.exports.monitors = monitors;