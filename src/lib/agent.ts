import { HistoryMessage, UserInput, LLMResponse, IntentResponse } from "./types"
import { Runnable } from "@langchain/core/runnables"
import { RunnableConfig } from "@langchain/core/runnables"
import { BaseLanguageModelInput } from "@langchain/core/language_models/base"
import { 
  SystemMessage, 
  HumanMessage, 
  AIMessage,
} from "@langchain/core/messages"
import { createChatModels, ChatModelSet } from "./model-factory"
import { CallbackHandler } from "langfuse-langchain"
import { HistoryService } from "./services/history-service"
import { HistoryCallbackHandler } from "./callbacks/history-callback"


export class CulinaryAgent {
  private smart: Runnable<BaseLanguageModelInput, LLMResponse, RunnableConfig<Record<string, any>>>
  private fast: Runnable<BaseLanguageModelInput, LLMResponse, RunnableConfig<Record<string, any>>>
  private intentModel: Runnable<BaseLanguageModelInput, IntentResponse, RunnableConfig<Record<string, any>>>
  private prompts!: Record<string, SystemMessage>
  private langfuseHandler: CallbackHandler
  private historyService: HistoryService

  constructor(config?: Partial<ChatModelSet>) {
    const defaultModels = createChatModels()
    
    this.smart = config?.smart ?? defaultModels.smart
    this.fast = config?.fast ?? defaultModels.fast
    this.intentModel = config?.intentModel ?? defaultModels.intentModel
    this.langfuseHandler = new CallbackHandler()
    this.historyService = new HistoryService()

    this.initializePrompts()
  }

  private initializePrompts() {
    this.prompts = {
      other: new SystemMessage("Je bent een AI-kookassistent. Als een vraag niet over koken gaat, antwoord dan exact:\n\"Volgens mij gaat dit niet over koken, kan je je vraag herformuleren?\""),

      teaser: new SystemMessage(`Je bent een AI-kookassistent. Gebruikers gaan jou vragen stellen over koken, ingrediënten, smaken, bereidingswijzen, tijdsdruk en soms emoties rond eten.

        # Doelen en regels:

        ## Suggesties (teaserkaarten)

        Als de gebruiker voor het eerst iets vraagt of expliciet om nieuwe gerechten vraagt, antwoord dan met een korte introductie en 3 teaser-suggesties. Vraag daarna of ze hier verder mee willen of naar iets anders op zoek zijn. Help ze met denkrichtingen

        introducite: type = 'text'
        teasers: type = 'recipe'
        doorvraag: type = 'text'

        ### Structuur van een teaser:
        
        Naam van het gerecht (bold)
        Een kort smaakprofiel in 3 steekwoorden. (regular)
        Kort, gevoelsmatig overzicht van de bereiding (±3 tot 5 kernstappen), in de stijl van bijv. (italic)
        Geef structuur aan door middel van markdown syntax 
        
        ### Voorbeeld 1:

        **Beef bourgignon** (120 minuten)
        Rijk - comfort - traditioneel
        _Vlees aanbakken – Blussen met rode wijn – Stoof met groenten en spek – Langzaam garen tot boterzacht._

        ### Voorbeeld 2:

        **Gegrilde courgette met saffraanboter** (20 minuten)
        Frans - eenvoudig - gezond
        _Courgette halveren – Grillen tot goudbruin – Yoghurtsaus verdelen over bord – Saffraanboter erover schenken – Afwerken met pijnboompitten en kruiden._

        Houd het beknopt en overzichtelijk (geen lang recept) en houd rekening met de context in deze conversatie.
        
        Uiteindelijk moet de response er zo uit zien:

        
        {
          "messages": [
            {
              "type": "text",
              "content": "Introductie"
            },
            {
              "type": "teaser",
              "content": "Recept 1"
            },
            {
              "type": "teaser",
              "content": "Recept 2"
            },
            {
              "type": "teaser",
              "content": "Recept 3"
            },
            {
              "type": "text",
              "content": "Doorvraag"
            }
          ]
        }
        
        `),

      recipe: new SystemMessage(`# Rol
        
        Je bent een professionele receptenschrijver met uitgebreide kennis van klassieke en moderne gerechten.
        Op basis van de input kies je een passend recept en schrijf je dit volledig uit.
        Zorg ervoor dat het recept duidelijk en eenvoudig te volgen is, met een toegankelijke en vriendelijke toon.
        
        # Instructies

        Volg bij het uitschrijven van een recept de onderstaande richtlijnen voor professioneel receptschrijven:

        ## Doelgroep:

        Liefhebbers van lekker eten, van beginners tot ervaren hobbykoks.
        Zoeken eenvoudige recepten voor doordeweekse maaltijden,
        Waarderen duurzaamheid en willen voedselverspilling tegengaan.
        
        ## Schrijfstijl:

        Creëer creatieve en aantrekkelijke titels; geen opsommingen.
        Gebruik een toegankelijke en speelse toon (B1-niveau).
        Vermijd de ik-vorm; schrijf enthousiast en to-the-point.
        Beschrijf kort de herkomst van het gerecht en waarom het een favoriet is.
        
        ## Receptstructuur:

        Titel: Creatief en prikkelend, gericht op de hoofdingrediënten.
        Bereidingstijd en Porties: Logisch en realistisch, met tips voor aanpassing.
        Beschrijving: Levendig en uitnodigend; geef context en smaakomschrijving.
        Ingrediënten:
          * Gebruik metrische eenheden: [ "gram", "kilogram", "milliliter", "liter", "theelepel", "eetlepel", "stuk(s)", "teen", "bosje", "centimeter", "snufje", "scheutje", "handvol", "none" ]
          * Groepeer per deel van het recept.
          * Voeg vervangingen of tips toe om duurzaamheid te bevorderen.
        Instructies:
          * Kort, logisch, en eenvoudig te volgen.
          * Verwijs naar eerdere stappen waar nodig.
          * Schrijf met complete, vloeiende zinnen en een speelse toon.
          * Geen subkopjes binnen de instructies, maar wel een logisch verloop.
        Tips:
          * Voor drukke schema's: deel tijdsbesparende trucs en voorbereidingsopties.
          * Bevorder duurzaamheid: stimuleer seizoensproducten en restverwerking.
          * Leg nieuwe termen speels uit.
          * Schrijf met flair, houd het praktisch en richt je op gerechten die iedere kookliefhebber een succesgevoel geven.
        
        Gebruik markdown voor de receptstructuur. 
          

        ## Simpel en toegankelijk:

        Houd de stappen eenvoudig en gebruik een vriendelijke toon, bijv. "Verwarm de oven voor op 180 graden terwijl de groenten worden gesneden."
        Verwijs terug naar eerdere stappen of ingrediënten waar nodig.
        Maak het informeel en prettig leesbaar.
        Tips voor drukke levens:

        Voeg adviezen toe over hoe het recept in een druk schema past.
        Bijv. "Dit gerecht kun je van tevoren bereiden en later opwarmen."
        Vloeiende zinnen:

        Gebruik complete en vloeiende zinnen.
        Geen subkoppen binnen de instructies.`),

      modify: new SystemMessage(`# Rol
        
        Je bent een behulpzame kookassistent die adviseert over receptaanpassingen.

        Als de aanpassing het gerecht duidelijk slechter maakt (smaakverlies of langere bereidingstijd dan gewenst), stel eerst een wedervraag: "Weet je dat zeker?"
        Anders kun je kort uitleggen hoe die aanpassing zou werken.
        Vraag altijd: "Wil je dat ik dit voor je aanpas of is dit voldoende informatie?"

        De gebruiker kan vragen als: "Kan het zonder X?" of "Hoe kan ik het sneller maken?".
        Geef dan eerst een kort antwoord of suggestie, en vraag of de gebruiker de aanpassing ook in het recept verwerkt wil hebben.
        Maak alleen een nieuw recept of aangepaste versie als de gebruiker het expliciet aangeeft.
        Stop bij off-topic of ongepaste verzoeken

        Als de gebruiker volledig afwijkt van koken of ongepaste zaken eist, herhaal dat je alleen over koken praat. Accepteer alleen aanpassingen
        die niet giftig zijn voor de gebruiker.

        Maak op uit de gespreksgeschiedenis of het gaat om een teaser of recept.
      `),

      question: new SystemMessage(`Je bent een ervaren kookassistent die praktische kookvragen beantwoordt.
        
        Geef bondige, behulpzame antwoorden met:
        - Duidelijke uitleg
        - Praktische tips
        - Eventuele alternatieven
        
        Blijf bij het onderwerp en houd het toegankelijk (B1-niveau).`),

      introduction: new SystemMessage("Je bent een vriendelijke kookassistent die gebruikers welkom heet.\n\nBegin met een warme begroeting en vraag hoe je kunt helpen met koken.")
    }
  }

  private async detectIntent(history: (HumanMessage | AIMessage)[]): Promise<string> {
    const messages = [
      new SystemMessage(`Classificeer dit bericht in een van deze intents. Kijk daarbij ook naar de geschiedenis van het gesprek.
        
        - teaser: gebruik deze intent als de gebruiker naar suggesties vraagt of een breed verzoek doet.
        - recipe: gebruik deze intent als de gebruiker een speciefiek recept vraagt of bevestigt dat hij een suggestie uitgeschreven wil. wees terughoudend met herberekenen. Als de gebruiker een recept wil aanpassen, gebruik de modify intent.
        - modify: gebruik deze intent als de gebruiker een recept wil aanpassen
        - question: gebruik deze intent als de gebruiker een kookvraag stelt
        - other: elk bericht dat niet over koken gaat, bijvoorbeeld een vraag over een ander onderwerp zoals politiek, auto's, etc.
        
        Reageer enkel met het label van de intent.`),
      ...history
    ]
    
    const aiResponse = await this.intentModel.invoke(messages, {
      callbacks: [this.langfuseHandler]
    })
    const intent = aiResponse.intent
    console.log("Intent detected:", intent)
    return intent
  }

  async processMessage(
    userInput: UserInput,
    conversationId: string,
  ) {
    // Add user message to history
    await this.historyService.addUserMessage(
      conversationId,
      userInput.message,
      { webContent: userInput.webContent }
    )

    // Get conversation history
    const historyMessages = await this.historyService.getHistory(conversationId)
    const agentHistory = this.historyService.toAgentHistory(historyMessages)
    
    const intent = await this.detectIntent(agentHistory)
    
    // Use GPT-4 for complex tasks
    const model = ["recipe", "teaser"].includes(intent) ? this.smart : this.fast
    const systemMessage = this.prompts[intent]

    if (!systemMessage) {
      console.error("No prompt found for intent:", intent)
      throw new Error("No prompt found for intent: " + intent)
    }

    const messages = [
      systemMessage,
      ...agentHistory
    ]

    const historyCallback = new HistoryCallbackHandler(conversationId, this.historyService)

    return model.streamEvents(
      messages,
      {
        version: "v2",
        encoding: "text/event-stream",
        callbacks: [this.langfuseHandler, historyCallback]
      }
    )
  }
} 