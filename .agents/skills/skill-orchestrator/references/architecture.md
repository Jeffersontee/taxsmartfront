# Arquitetura de Customizações da Workspace

Conforme os padrões do projeto TaxSmart:

1. **.agents/AGENTS.md**: Onde as regras de projeto (`Rules`) globais do repositório devem ser salvas. Regras rápidas que devem ser aplicadas em TODO momento pelo agente.
2. **.agents/skills/**: Pasta raiz das Skills.
3. **Módulos da Skill**:
   - `SKILL.md`: Apenas Metadados (Frontmatter YAML com `name` e `description`) e um body muito curto. Somente ele é lido para dar gatilho (trigger) na skill.
   - `scripts/`: Onde guardamos bash/node scripts para evitar que o LLM precise ficar inferindo comandos repetitivos.
   - `references/`: Arquivos Markdown de apoio que o modelo pode ler sob demanda caso a Skill.md exija.

Este orquestrador foi criado justamente para automatizar a obediência a este padrão de diretórios, de forma que o Agente não erre nomes ou locais na hora de injetar novos aprendizados de engenharia.
