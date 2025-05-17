import { Client, GatewayIntentBits, Partials, Collection, Events, REST, Routes, SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, ComponentType, PermissionFlagsBits } from 'discord.js';
import { IStorage } from './storage';

interface Command {
  data: any; // SlashCommandBuilder または SlashCommandOptionsOnlyBuilder
  execute: (interaction: any) => Promise<void>;
}

export class DiscordBot {
  private client: Client;
  private token: string;
  private commands: Collection<string, Command>;
  private storage: IStorage;
  private clientId: string;
  
  constructor(token: string, clientId: string, storage: IStorage) {
    this.token = token;
    this.clientId = clientId;
    this.storage = storage;
    
    // Initialize the Discord client
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
      ],
      partials: [Partials.Channel]
    });
    
    this.commands = new Collection();
    
    // Register commands
    this.registerCommands();
    
    // Set up event handlers
    this.setupEventHandlers();
  }
  
  private registerCommands() {
    // Auth command
    const authCommand = {
      data: new SlashCommandBuilder()
        .setName('auth')
        .setDescription('認証プロセスを開始します。')
        .setDefaultMemberPermissions(null), // 全てのメンバーが使用可能
      execute: async (interaction: any) => {
        try {
          const guildId = interaction.guild?.id;
          const userId = interaction.user.id;
          const userName = interaction.user.username;
          const userTag = interaction.user.tag;
          
          if (!guildId) {
            await interaction.reply({ content: 'このコマンドはサーバー内でのみ使用できます。', ephemeral: true });
            return;
          }
          
          // Get bot settings
          const settings = await this.storage.getBotSettingsByGuildId(guildId);
          if (!settings) {
            await interaction.reply({ content: 'このサーバーの設定が見つかりません。サーバー管理者に連絡してください。', ephemeral: true });
            return;
          }
          
          // Get enabled roles for this guild
          const enabledRoles = await this.storage.getEnabledRolesByGuildId(guildId);
          if (enabledRoles.length === 0) {
            await interaction.reply({ content: '付与するロールが設定されていません。サーバー管理者に連絡してください。', ephemeral: true });
            return;
          }
          
          // Create authentication panel with buttons
          const authEmbed = new EmbedBuilder()
            .setTitle('メンバー認証')
            .setDescription('下のボタンをクリックして認証を完了してください。認証が完了すると、適切なロールが付与されます。')
            .setColor(0x5865F2)
            .addFields(
              { name: '認証ロール', value: enabledRoles.map(r => `<@&${r.id}>`).join(', ') }
            )
            .setFooter({ text: `${interaction.guild.name}サーバー認証システム` });
          
          // Create authenticate button
          const authenticateButton = new ButtonBuilder()
            .setCustomId('authenticate')
            .setLabel('認証する')
            .setStyle(ButtonStyle.Success);
          
          // Create cancel button
          const cancelButton = new ButtonBuilder()
            .setCustomId('cancel_auth')
            .setLabel('キャンセル')
            .setStyle(ButtonStyle.Secondary);
          
          // Add buttons to action row
          const actionRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(authenticateButton, cancelButton);
          
          // Send authentication panel
          const response = await interaction.reply({
            embeds: [authEmbed],
            components: [actionRow],
            ephemeral: true
          });
          
          // Create collector for button interactions
          const collector = response.createMessageComponentCollector({ 
            componentType: ComponentType.Button,
            time: 60000 // 1 minute timeout
          });
          
          // Handle button interactions
          collector.on('collect', async (i: any) => {
            if (i.user.id !== userId) {
              await i.reply({ content: 'この認証パネルは他のユーザーのものです。自分用の認証パネルを作成するには `/auth` コマンドを使用してください。', ephemeral: true });
              return;
            }
            
            // Handle authenticate button
            if (i.customId === 'authenticate') {
              try {
                // Add roles to the user
                const member = interaction.guild.members.cache.get(userId);
                if (member) {
                  for (const role of enabledRoles) {
                    try {
                      await member.roles.add(role.id);
                    } catch (error) {
                      console.error(`Failed to add role ${role.name} to user ${userName}:`, error);
                    }
                  }
                }
                
                // Update the embed to show success
                const successEmbed = new EmbedBuilder()
                  .setTitle('認証成功')
                  .setDescription(settings.successMessage)
                  .setColor(0x3BA55C)
                  .addFields(
                    { name: '付与されたロール:', value: enabledRoles.map(r => `<@&${r.id}>`).join(', ') }
                  );
                
                await i.update({ embeds: [successEmbed], components: [] });
                
                // Send DM if enabled
                if (settings.dmNotify) {
                  try {
                    await interaction.user.send({
                      embeds: [{
                        title: `${interaction.guild.name} での認証成功`,
                        description: settings.successMessage,
                        color: 0x3BA55C,
                        fields: [
                          {
                            name: '付与されたロール:',
                            value: enabledRoles.map(r => `${r.name}`).join(', '),
                          }
                        ]
                      }]
                    });
                  } catch (error) {
                    console.error(`Failed to send DM to user ${userName}:`, error);
                  }
                }
                
                // Log this authentication action
                if (settings.logActions) {
                  await this.storage.createAuthLog({
                    userId: userId,
                    guildId: guildId,
                    action: '認証',
                    status: 'success',
                    details: `ユーザー ${userTag} が認証を完了しました。`
                  });
                }
              } catch (error) {
                console.error('Error in auth button:', error);
                await i.update({ 
                  content: 'エラーが発生しました。もう一度試すか、サーバー管理者に連絡してください。',
                  embeds: [],
                  components: []
                });
              }
            } 
            // Handle cancel button
            else if (i.customId === 'cancel_auth') {
              const cancelEmbed = new EmbedBuilder()
                .setTitle('認証キャンセル')
                .setDescription('認証プロセスがキャンセルされました。')
                .setColor(0xED4245);
              
              await i.update({ embeds: [cancelEmbed], components: [] });
              
              // Log cancelled authentication
              if (settings.logActions) {
                await this.storage.createAuthLog({
                  userId: userId,
                  guildId: guildId,
                  action: '認証キャンセル',
                  status: 'failure',
                  details: `ユーザー ${userTag} が認証をキャンセルしました。`
                });
              }
            }
          });
          
          // Handle collector end (timeout)
          collector.on('end', async (collected) => {
            if (collected.size === 0) {
              try {
                const timeoutEmbed = new EmbedBuilder()
                  .setTitle('認証タイムアウト')
                  .setDescription('認証プロセスが時間切れになりました。もう一度 `/auth` コマンドを使用してください。')
                  .setColor(0xED4245);
                
                await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
                
                // Log timed out authentication
                if (settings.logActions) {
                  await this.storage.createAuthLog({
                    userId: userId,
                    guildId: guildId,
                    action: '認証タイムアウト',
                    status: 'failure',
                    details: `ユーザー ${userTag} の認証がタイムアウトしました。`
                  });
                }
              } catch (error) {
                console.error('Error updating timeout message:', error);
              }
            }
          });
        } catch (error) {
          console.error('Authentication error:', error);
          await interaction.reply({ content: '認証処理中にエラーが発生しました。サーバー管理者に連絡してください。', ephemeral: true });
        }
      }
    };
    
    // Auth help command
    const authHelpCommand = {
      data: new SlashCommandBuilder()
        .setName('auth-help')
        .setDescription('認証コマンドに関するヘルプを表示します。')
        .setDefaultMemberPermissions(null), // 全てのメンバーが使用可能
      execute: async (interaction: any) => {
        await interaction.reply({
          embeds: [{
            title: '認証ヘルプ',
            description: '以下のコマンドが利用可能です:',
            color: 0x5865F2,
            fields: [
              {
                name: '/auth',
                value: '基本の認証プロセスを開始します。',
              },
              {
                name: '/auth-help',
                value: '認証コマンドに関するヘルプを表示します。',
              },
              {
                name: '/auth-status',
                value: '現在の認証状態を確認します。',
              }
            ]
          }],
          ephemeral: true
        });
      }
    };
    
    // Auth status command
    const authStatusCommand = {
      data: new SlashCommandBuilder()
        .setName('auth-status')
        .setDescription('現在の認証状態を確認します。')
        .setDefaultMemberPermissions(null), // 全てのメンバーが使用可能
      execute: async (interaction: any) => {
        try {
          const guildId = interaction.guild?.id;
          const userId = interaction.user.id;
          
          if (!guildId) {
            await interaction.reply({ content: 'このコマンドはサーバー内でのみ使用できます。', ephemeral: true });
            return;
          }
          
          // Get enabled roles for this guild
          const enabledRoles = await this.storage.getEnabledRolesByGuildId(guildId);
          
          // Check user's roles
          const member = interaction.guild.members.cache.get(userId);
          const userRoles = member.roles.cache;
          
          const assignedAuthRoles = enabledRoles.filter(role => userRoles.has(role.id));
          const missingAuthRoles = enabledRoles.filter(role => !userRoles.has(role.id));
          
          if (assignedAuthRoles.length > 0) {
            await interaction.reply({
              embeds: [{
                title: '認証状態',
                description: '認証済みです。以下のロールが付与されています:',
                color: 0x3BA55C,
                fields: [
                  {
                    name: '付与されたロール:',
                    value: assignedAuthRoles.map(r => `<@&${r.id}>`).join(', ') || 'なし',
                  },
                  {
                    name: '不足しているロール:',
                    value: missingAuthRoles.map(r => `<@&${r.id}>`).join(', ') || 'なし',
                  }
                ]
              }],
              ephemeral: true
            });
          } else {
            await interaction.reply({
              embeds: [{
                title: '認証状態',
                description: '認証されていません。`/auth` コマンドを使用して認証を行ってください。',
                color: 0xED4245,
                fields: [
                  {
                    name: '必要なロール:',
                    value: enabledRoles.map(r => `<@&${r.id}>`).join(', ') || 'なし',
                  }
                ]
              }],
              ephemeral: true
            });
          }
        } catch (error) {
          console.error('Status check error:', error);
          await interaction.reply({ content: '状態確認中にエラーが発生しました。', ephemeral: true });
        }
      }
    };
    
    // Auth panel command (for admins to create permanent auth buttons)
    const authPanelCommand = {
      data: new SlashCommandBuilder()
        .setName('auth-panel')
        .setDescription('指定したチャンネルに常設の認証ボタンパネルを設置します。')
        .addChannelOption(option => 
          option.setName('channel')
            .setDescription('ボタンを設置するチャンネル')
            .setRequired(true)),
      execute: async (interaction: any) => {
        try {
          const guildId = interaction.guild?.id;
          if (!guildId) {
            await interaction.reply({ content: 'このコマンドはサーバー内でのみ使用できます。', ephemeral: true });
            return;
          }
          
          // Get bot settings
          const settings = await this.storage.getBotSettingsByGuildId(guildId);
          if (!settings) {
            await interaction.reply({ content: 'このサーバーの設定が見つかりません。サーバー管理者に連絡してください。', ephemeral: true });
            return;
          }
          
          // Get enabled roles for this guild
          const enabledRoles = await this.storage.getEnabledRolesByGuildId(guildId);
          if (enabledRoles.length === 0) {
            await interaction.reply({ content: '付与するロールが設定されていません。先に管理画面でロールを設定してください。', ephemeral: true });
            return;
          }
          
          const channel = interaction.options.getChannel('channel');
          
          // Create authentication panel with button
          const authEmbed = new EmbedBuilder()
            .setTitle('メンバー認証')
            .setDescription('下のボタンをクリックして認証を完了してください。認証が完了すると、適切なロールが付与されます。')
            .setColor(0x5865F2)
            .addFields(
              { name: '認証ロール', value: enabledRoles.map(r => `<@&${r.id}>`).join(', ') }
            )
            .setFooter({ text: `${interaction.guild.name}サーバー認証システム` });
          
          // Create authenticate button
          const authenticateButton = new ButtonBuilder()
            .setCustomId('authenticate_panel')
            .setLabel('認証する')
            .setStyle(ButtonStyle.Success);
          
          // Add button to action row
          const actionRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(authenticateButton);
          
          // Send authentication panel to the specified channel
          await channel.send({
            embeds: [authEmbed],
            components: [actionRow],
          });
          
          await interaction.reply({ content: `${channel}に認証パネルを設置しました！`, ephemeral: true });
        } catch (error) {
          console.error('Error creating auth panel:', error);
          await interaction.reply({ content: '認証パネルの設置中にエラーが発生しました。', ephemeral: true });
        }
      }
    };
    
    // Add commands to collection
    this.commands.set('auth', authCommand);
    this.commands.set('auth-help', authHelpCommand);
    this.commands.set('auth-status', authStatusCommand);
    this.commands.set('auth-panel', authPanelCommand);
  }
  
  private setupEventHandlers() {
    // When bot is ready
    this.client.once(Events.ClientReady, (client) => {
      console.log(`Ready! Logged in as ${client.user.tag}`);
    });
    
    // Handle slash commands
    this.client.on(Events.InteractionCreate, async (interaction) => {
      // Handle slash commands
      if (interaction.isCommand()) {
        const command = this.commands.get(interaction.commandName);
        if (!command) return;
        
        try {
          await command.execute(interaction);
        } catch (error) {
          console.error(error);
          const errorMessage = 'コマンドの実行中にエラーが発生しました。';
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, ephemeral: true });
          } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
          }
        }
      }
      
      // Handle button interactions for authentication panel
      if (interaction.isButton()) {
        if (interaction.customId === 'authenticate_panel') {
          try {
            const guildId = interaction.guild?.id;
            const userId = interaction.user.id;
            const userName = interaction.user.username;
            const userTag = interaction.user.tag;
            
            if (!guildId) {
              await interaction.reply({ content: 'このコマンドはサーバー内でのみ使用できます。', ephemeral: true });
              return;
            }
            
            // Get bot settings
            const settings = await this.storage.getBotSettingsByGuildId(guildId);
            if (!settings) {
              await interaction.reply({ content: 'このサーバーの設定が見つかりません。サーバー管理者に連絡してください。', ephemeral: true });
              return;
            }
            
            // Get enabled roles for this guild
            const enabledRoles = await this.storage.getEnabledRolesByGuildId(guildId);
            if (enabledRoles.length === 0) {
              await interaction.reply({ content: '付与するロールが設定されていません。サーバー管理者に連絡してください。', ephemeral: true });
              return;
            }
            
            // Add roles to the user
            const member = interaction.guild.members.cache.get(userId);
            if (member) {
              for (const role of enabledRoles) {
                try {
                  await member.roles.add(role.id);
                } catch (error) {
                  console.error(`Failed to add role ${role.name} to user ${userName}:`, error);
                }
              }
            }
            
            // Send success message
            await interaction.reply({
              content: '',
              embeds: [{
                title: '認証成功',
                description: settings.successMessage,
                color: 0x3BA55C,
                fields: [
                  {
                    name: '付与されたロール:',
                    value: enabledRoles.map(r => `<@&${r.id}>`).join(', '),
                  }
                ]
              }],
              ephemeral: true
            });
            
            // Send DM if enabled
            if (settings.dmNotify) {
              try {
                await interaction.user.send({
                  embeds: [{
                    title: `${interaction.guild.name} での認証成功`,
                    description: settings.successMessage,
                    color: 0x3BA55C,
                    fields: [
                      {
                        name: '付与されたロール:',
                        value: enabledRoles.map(r => `${r.name}`).join(', '),
                      }
                    ]
                  }]
                });
              } catch (error) {
                console.error(`Failed to send DM to user ${userName}:`, error);
              }
            }
            
            // Log this authentication action
            if (settings.logActions) {
              await this.storage.createAuthLog({
                userId: userId,
                userName: userName,
                userTag: userTag,
                guildId: guildId,
                action: '認証',
                status: 'success',
                details: `ユーザー ${userTag} が認証パネルから認証しました。`
              });
            }
          } catch (error) {
            console.error('Error in authenticate button:', error);
            await interaction.reply({ content: '認証処理中にエラーが発生しました。サーバー管理者に連絡してください。', ephemeral: true });
          }
        }
      }
    });
    
    // Handle guild member join (for auto-auth if enabled)
    this.client.on(Events.GuildMemberAdd, async (member) => {
      try {
        const guildId = member.guild.id;
        
        // Get bot settings
        const settings = await this.storage.getBotSettingsByGuildId(guildId);
        if (!settings || !settings.autoAuth) return;
        
        // If auto-auth is enabled, we would implement the authentication process here
        console.log(`New member joined: ${member.user.tag}. Auto-auth is enabled.`);
        
        // This would be similar to the auth command logic
      } catch (error) {
        console.error('Error in GuildMemberAdd event:', error);
      }
    });
  }
  
  // Deploy commands to Discord
  async deployCommands() {
    try {
      const rest = new REST({ version: '10' }).setToken(this.token);
      
      const commandsData = Array.from(this.commands.values()).map(command => command.data.toJSON());
      
      console.log(`Started refreshing ${commandsData.length} application (/) commands.`);
      
      const data = await rest.put(
        Routes.applicationCommands(this.clientId),
        { body: commandsData },
      );
      
      console.log(`Successfully reloaded application (/) commands.`);
    } catch (error) {
      console.error(error);
    }
  }
  
  // Start the bot
  async start() {
    try {
      await this.client.login(this.token);
      await this.deployCommands();
    } catch (error) {
      console.error('Failed to start the Discord bot:', error);
      throw error;
    }
  }
  
  // Stop the bot
  async stop() {
    this.client.destroy();
  }
  
  // Get bot client (for external use if needed)
  getClient() {
    return this.client;
  }
}
