# JustBOT 

A Discord bot made for the Justcord Discord server with a little bit of humour.

<div align="center">
    <img width="726" height="657" alt="image" src="https://github.com/user-attachments/assets/e5c20262-9bb8-4bac-bf5d-81c6e479086f" />
</div>

Features:

- many well-done commands from different categories 
- fully customizable look and feel through configuration and Translations API
- dynamic command and configuration loader
- automatic hot reload with type checking
- regular database backups sent to the special channel 

## Running JustBOT

Ensure you have Deno installed. If not, install it from a shell command from [deno.land](https://deno.land).

Next, start the bot using this command:

`make run`

Or with hot reload on file changes:

`make dev`

You may want to register Git hooks to run type checks, tests and linter before commiting:

`make hook-register`

> [!IMPORTANT]
> To see any verbose messages, you have to set `JB_DEVELOPMENT` enviorment variable to `true`

It's that simple!
