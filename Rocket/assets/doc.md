# Objetos Globais

## categories

O objeto `categories` é um Liquid Drop usado para representar uma categoria. Ele fornece acesso aos atributos da categoria por meio de métodos de leitura.

- `id`: O ID da categoria.
- `featured`: Indica se a categoria é uma categoria em destaque.
- `parent_id`: O ID da categoria pai.
- `is_parent`: Indica se a categoria é uma categoria pai.
- `name`: O nome da categoria.
- `slug`: O slug da categoria.
- `url`: A URL da categoria.
- `url_path`: O caminho da URL da categoria.
- `path`: O caminho completo da categoria.
- `external_url`: A URL externa associada à categoria.
- `canonical_url`: A URL canônica da categoria.
- `order`: A ordem da categoria.
- `children`: Uma lista de objetos `CategoryDrop` representando as categorias filhas.

Exemplo de uso:

```
{% for category in categories %}
  <h2>{{ category.name }}</h2>
  {% if category.children.size > 0 %}
    <ul>
      {% for child in category.children %}
        <li>{{ child.name }}</li>
      {% endfor %}
    </ul>
  {% endif %}
{% endfor %}
```

Isso renderizará os nomes das categorias e suas categorias filhas, se houver.

## merchant

O objeto `merchant` é um Liquid Drop usado para representar as informações de um comerciante. Ele fornece acesso aos atributos do comerciante e outros objetos relacionados por meio de métodos de leitura.

- `id`: O ID do comerciante.
- `alias`: O alias do comerciante.
- `domain`: O domínio do comerciante.
- `base_url`: A URL base do comerciante.
- `logo_url`: A URL do logotipo do comerciante.
- `has_mp`: Indica se o comerciante possui um MP (Marketplace).
- `theme`: O tema do comerciante.
- `theme_id`: O ID do tema do comerciante.
- `api`: A API do comerciante.
- `promotion`: A promoção do comerciante.
- `shipping`: As informações de envio do comerciante.
- `pricing`: As informações de preço do comerciante.
- `meta_tags`: As tags meta do comerciante.
- `services`: O objeto `services` é um Liquid Drop usado para representar as informações de serviços de um comerciante. Ele fornece acesso aos atributos dos serviços por meio de métodos de leitura.
    - `google`: As informações do serviço do Google.
    - `chat`: As informações do serviço de chat.
- `checkout`: O objeto `CheckoutDrop` é um Liquid Drop usado para representar as informações de checkout de um comerciante. Ele fornece acesso aos atributos do checkout por meio de métodos de leitura.
    - `base_domain`: O domínio base do checkout.
    - `skip_cart`: Indica se o carrinho deve ser ignorado no processo de checkout.
    - `items`: Os itens do carrinho.
    - `items_json`: Os itens do carrinho em formato JSON.
    - `redirect_to`: O URL de redirecionamento após o checkout.
    - `orders`: As informações dos pedidos.
    - `store_token`: O token da loja.
    - `default_card`: O cartão padrão.

- `manifest`: O objeto `ManifestDrop` é um Liquid Drop usado para representar as informações de manifesto de um comerciante. Ele fornece acesso aos atributos do manifesto por meio de métodos de leitura.

    - `name`: O nome do manifesto.
    - `short_name`: O nome curto do manifesto.
    - `start_url`: A URL de início do manifesto.
    - `description`: A descrição do manifesto.
    - `lang`: O idioma do manifesto.

- `meta`: O objeto `meta` é um Liquid Drop usado para representar as informações de meta tags de um comerciante. Ele fornece acesso aos atributos das meta tags por meio de métodos de leitura.

    - `title`: O título das meta tags.
    - `description`: A descrição das meta tags.
    - `default_icon`: O ícone padrão das meta tags.

- `cookies_policy`: O objeto `CookiesPolicyDrop` é um Liquid Drop usado para representar as informações da política de cookies de um comerciante. Ele fornece acesso aos atributos da política de cookies por meio de métodos de leitura.
    - `active`: Indica se a política de cookies está ativa.
    - `name`: O nome da política de cookies.
    - `slug`: O slug da política de cookies.
    - `content`: O conteúdo da política de cookies.
    - `show_page`: Indica se a página da política de cookies deve ser exibida.

Exemplo de uso:

```
<html>
  <head>
    <meta charset="UTF-8">
    <title>{{ merchant.meta.title }}</title>
    <meta name="description" content="{{ merchant.meta.description }}">
    <link rel="icon" href="{{ merchant.meta.default_icon }}">
  </head>

    <body>
      <header>
        <h1>Bem-vindo(a) à loja {{ merchant.meta.title }}</h1>
        <img src="{{ merchant.logo_url }}" alt="{{ merchant.alias }} logo">
      </header>

      <h3>{{ merchant.meta.description }}!</h1>

      ...
```

## company

O objeto `company` é um Liquid Drop usado para representar as informações de uma empresa. Ele fornece acesso aos atributos da empresa e outros objetos relacionados por meio de métodos de leitura.

- `person_type`: O tipo de pessoa da empresa.
- `cnpj`: O CNPJ da empresa.
- `razao_social`: A razão social da empresa.
- `name`: O nome da empresa.
- `cpf`: O CPF da empresa.
- `phone`: O telefone da empresa.
- `whatsapp`: O número de WhatsApp da empresa.
- `email`: O email da empresa.
- `phone`: O objeto `PhoneDrop` é um Liquid Drop usado para representar as informações de um telefone. Ele fornece acesso aos atributos do telefone por meio de métodos de leitura.
    - `code`: O código do país do telefone.
    - `formated_number`: O número de telefone formatado.
    - `number`: O número de telefone.
- `whatsapp`: O objeto `WhatsappDrop` é um Liquid Drop usado para representar as informações de um número de WhatsApp. Ele fornece acesso aos atributos do número de WhatsApp por meio de métodos de leitura.
    - `formated_number`: O número de WhatsApp formatado.
    - `number`: O número de WhatsApp.
    - `url`: A URL do número de WhatsApp.

Exemplo de uso:

```
<h1>Informações da Empresa</h1>
<p>Tipo de Pessoa: {{ company.person_type }}</p>
{% if company.person_type == 'Jurídica' %}
  <p>CNPJ: {{ company.cnpj }}</p>
  <p>Razão Social: {{ company.razao_social }}</p>
{% else %}
  <p>Nome: {{ company.name }}</p>
  <p>CPF: {{ company.cpf }}</p>
{% endif %}
<p>Telefone: {{ company.phone.formated_number }}</p>
<p>WhatsApp: {{ company.whatsapp.formated_number }}</p>
<p>Email: {{ company.email }}</p>
```

## company_address

O objeto `company_address` é um Liquid Drop usado para representar as informações de endereço de uma empresa. Ele fornece acesso aos atributos do endereço por meio de métodos de leitura.

- `street`: A rua do endereço.
- `number`: O número do endereço.
- `complement`: O complemento do endereço.
- `neighborhood`: O bairro do endereço.
- `city`: A cidade do endereço.
- `state`: O estado do endereço.
- `zipcode`: O CEP do endereço.
- `full_address`: O endereço completo.

Exemplo de uso:

```
<h1>Company Address</h1>
<p>Street: {{ company_address.street }}</p>
<p>Number: {{ company_address.number }}</p>
<p>Complement: {{ company_address.complement }}</p>
<p>Neighborhood: {{ company_address.neighborhood }}</p>
<p>City: {{ company_address.city }}</p>
<p>State: {{ company_address.state }}</p>
<p>ZIP Code: {{ company_address.zipcode }}</p>
```

## company_social_media

O objeto `company_social_media` é um Liquid Drop usado para representar as informações de mídia social de uma empresa. Ele fornece acesso aos atributos das URLs das redes sociais por meio de métodos de leitura.

- `facebook_url`: A URL do perfil do Facebook.
- `instagram_url`: A URL do perfil do Instagram.
- `youtube_url`: A URL do canal do YouTube.
- `pinterest_url`: A URL do perfil do Pinterest.
- `tiktok_url`: A URL do perfil do TikTok.
- `twitter_url`: A URL do perfil do Twitter.

Exemplo de uso:

```
<h1>Social Media</h1>
<p>Facebook: <a href="{{ company_social_media.facebook_url }}">Facebook Profile</a></p>
<p>Instagram: <a href="{{ company_social_media.instagram_url }}">Instagram Profile</a></p>
...
```

## pages

O array `pages` é um Liquid Drop composto pelo objeto page, usado para representar informações de uma página. Ele fornece acesso aos atributos como nome, slug e caminho por meio de métodos de leitura.

- `name`: O nome da página.
- `slug`: O slug da página.
- `path`: O caminho da página.

Exemplo de uso:

```
<ul>
  {% for page in pages %}
    <li><a href="{{ page.path }}">{{ page.name }}</a></li>
  {% endfor %}
</ul>
```

## banners

O array `banners` é um Liquid Drop composto pelo objeto banner, usado para representar informações de um banner. Ele fornece acesso aos atributos como ID, tipo, nome, URL da imagem e outros detalhes relacionados ao banner por meio de métodos de leitura.


- `id`: O ID do banner.
- `product_id`: O ID do produto relacionado ao banner.
- `type`: O tipo de banner.
- `active`: Indica se o banner está ativo.
- `home`: Indica se o banner está visível na página inicial.
- `name`: O nome do banner.
- `slug`: O slug do banner.
- `image_url`: A URL da imagem do banner.
- `mobile_image_url`: A URL da imagem do banner para dispositivos móveis.
- `link`: O link associado ao banner.
- `expired`: Indica se o banner está expirado.
- `stopwatch`: Indica se o banner possui um cronômetro.
- `stopwatch_expires_in`: O tempo restante do cronômetro do banner.
- `start_at`: A data de início do banner.
- `end_at`: A data de término do banner.
- `first_banner`: Indica se o banner é o primeiro da lista.
- `dimensions`: As dimensões da imagem do banner.
- `product`: O objeto de produto relacionado ao banner.

Exemplo de uso:

```
{% for banner in banners %}
  <div>
    <h2>{{ banner.name }}</h2>
    <img src="{{ banner.image_url }}" alt="{{ banner.name }} Image">
    <p>{{ banner.type }}</p>
    <p>Link: <a href="{{ banner.link }}">{{ banner.link }}</a></p>
  </div>
{% endfor %}
```
