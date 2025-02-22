import assert = require('assert');
import { formatStringWithPrettier } from '../formatting/prettier/utils';

suite('Prettier Formatter Basic Nodes', () => {
    test('it doesnt remove variable parts with neighboring numeric nodes', () => {
        assert.strictEqual(formatStringWithPrettier('{{ assets:0 }}').trim(), '{{ assets:0 }}');
        assert.strictEqual(formatStringWithPrettier('{{ assets:0:0 }}').trim(), '{{ assets:0:0 }}');
        assert.strictEqual(formatStringWithPrettier('{{ assets:0:0:test }}').trim(), '{{ assets:0:0:test }}');
        assert.strictEqual(formatStringWithPrettier('{{ assets.0:0:test }}').trim(), '{{ assets.0:0:test }}');
        assert.strictEqual(formatStringWithPrettier('{{ assets.0:0.test }}').trim(), '{{ assets.0:0.test }}');
    });

    test('it preserves hyphens in variables', () => {
        const input = `{{ tag:test-hyphens 
        
}} {{ 5-5 }} {{ test-var - another-var }}`;
        const output = "{{ tag:test-hyphens }} {{ 5 - 5 }} {{ test-var - another-var }}";
        assert.strictEqual(formatStringWithPrettier(input).trim(), output);
    });

    test('it preserves hyphens in tags', () => {
        const input = `{{ tag:test-hyphens 
        
        }} {{ 5-5 }}`;

        assert.strictEqual(formatStringWithPrettier(input).trim(), "{{ tag:test-hyphens }} {{ 5 - 5 }}");
    });

    test('it does not double up', () => {
        const initial = `{{# Page title #}}
        <title>
            {{ yield:seo_title }}
            {{ seo_title ? seo_title : title }}
            {{ seo:title_separator ? seo:title_separator : " &#124; " }}
            {{ seo:change_page_title where="collection:{collection}" }}
                {{ if what_to_add == 'collection_title' }}
                    {{ collection:title }}
                {{ elseif what_to_add == 'custom_text' }}
                    {{ custom_text }}
                {{ /if }}
                {{ seo:title_separator ? seo:title_separator : " &#124; " }}
            {{ /seo:change_page_title }}
            {{ seo:site_name ? seo:site_name : config:app:name }}
        </title>
        
        {{# Page description #}}
        {{ if seo_description }}
              <meta name="description" content="{{ seo_description }}">
        {{ elseif seo:collection_defaults }}
              <meta name="description" content="{{ partial:snippets/fallback_description }}">
        {{ /if }}
        
        
        {{# Some other comments #}}
        {{ if seo_description }}
            <meta name="description" content="{{ seo_description }}">
        {{ elseif seo:collection_defaults }}
            <meta name="description" content="{{ partial:snippets/fallback_description }}">
        {{ /if }}`;
        const output = `{{# Page title #}}
<title>
    {{ yield:seo_title }} {{ seo_title ? seo_title : title }}
    {{ seo:title_separator ? seo:title_separator : " &#124; " }}
    {{ seo:change_page_title where="collection:{collection}" }}
    {{ if what_to_add == 'collection_title' }} {{ collection:title }}
    {{ elseif what_to_add == 'custom_text' }}
    {{ custom_text }} {{ /if }}
    {{ seo:title_separator ? seo:title_separator : " &#124; " }}
    {{ /seo:change_page_title }}
    {{ seo:site_name ? seo:site_name : config:app:name }}
</title>

{{# Page description #}}
{{ if seo_description }}
    <meta name="description" content="{{ seo_description }}" />
{{ elseif seo:collection_defaults }}
    <meta
        name="description"
        content="{{ partial:snippets/fallback_description }}"
    />
{{ /if }}
{{# Some other comments #}}
{{ if seo_description }}
    <meta name="description" content="{{ seo_description }}" />
{{ elseif seo:collection_defaults }}
    <meta
        name="description"
        content="{{ partial:snippets/fallback_description }}"
    />
{{ /if }}`;
        assert.strictEqual(formatStringWithPrettier(initial).trim(), output);
        for (let i = 0; i <= 10; i++) {
            assert.strictEqual(formatStringWithPrettier(output).trim(), output);
        }
    });

    test('it indents nested pairs nicely', () => {
        const expected = `{{ fields }}
    {{ if something }}
        <div>
            <label></label>
        </div>
    {{ /if }}
{{ /fields }}`;

        assert.strictEqual(formatStringWithPrettier(`{{ fields }}
        {{ if something }}
        <div>
        <label></label>
    </div>
        {{ /if}}
    {{ /fields }}`).trim(), expected);
    });

    test('template test 13', () => {
        const template = `{{ items limit="2" }}<{{ value }} />{{ /items }}{{ items | count }}`;
        const output = `{{ items limit="2" }}
    <{{ value }} />
{{ /items }}
{{ items | count }}`;
        assert.strictEqual(formatStringWithPrettier(template).trim(), output);
    });

    test('smart line breaking', () => {
        const template = `{{ tag:array }}{{ noparse }}{{ string }}{{ /noparse }}{{ /tag:array }}
        {{ tag:loop }} <p>{{ index }} {{ noparse }}{{ string }}{{ /noparse }} {{ string }}</p> {{ /tag:loop }}
        
        
        {{ items | count }}{{ items limit="2" }}<{{ value }} />{{ /items }}`;
        const output = `{{ tag:array }}
    {{ noparse }}{{ string }}{{ /noparse }}
{{ /tag:array }}
{{ tag:loop }}
    <p>
        {{ index }}
        {{ noparse }}{{ string }}{{ /noparse }} {{ string }}
    </p>
{{ /tag:loop }}
{{ items | count }}
{{ items limit="2" }}
    <{{ value }} />
{{ /items }}`;
        assert.strictEqual(formatStringWithPrettier(template).trim(), output);
    });

    test('it indents at nested levels', () => {
        const input = `<nav
class="bg-blue mx-auto flex max-w-5xl flex-wrap items-center justify-between py-10 lg:justify-start"
>    <div class="text-md font-medium antialiased">
{{ if something }}
        something -here
{{ else }}
    nope
{{ /if }}
<a href="/" class="mr-12 block text-xl font-black lg:inline-block">
    {{ settings:site_name }}
</a>
</div></nav>`;
        const output = `<nav
    class="bg-blue mx-auto flex max-w-5xl flex-wrap items-center justify-between py-10 lg:justify-start"
>
    <div class="text-md font-medium antialiased">
        {{ if something }}
            something -here
        {{ else }}
            nope
        {{ /if }}
        <a href="/" class="mr-12 block text-xl font-black lg:inline-block">
            {{ settings:site_name }}
        </a>
    </div>
</nav>`;
        assert.strictEqual(
            formatStringWithPrettier(input).trim(),
            output
        );
    });


    test('it doesnt break up tags and preserves line breaks', () => {
        const input = `<!DOCTYPE html>
        <html lang="{{ site:short_locale }}">
          <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
            <meta name="theme-color" content="#000000" />
            {{ seo_pro:meta }}
            {{ yield:preconnect }}
            <link rel="icon" href="/favicon.ico" sizes="any" />
            <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <link rel="manifest" href="/manifest.webmanifest" />
                                        {{ webpack:style name="print.css" loading="print" }}
                                        {{ webpack:style name="critical.css" loading="inline" }}
                                        {{ webpack:style name="main.css" preload="true" }}
                                       
                                       
                                        {{ webpack }}
                                        
                                        {{ yield:page_scripts }}
          </head>
          <body>
            {{ test that="{ 2     -      3 + 3}" }}
            {{ partial:common/patterns/skip-link }}
            {{ partial:common/patterns/page-transition }}
            {{ partial:common/patterns/navbar }}
            <main>{{ template_content }}</main>        
            {{ partial:common/patterns/social }}
                            {{ partial:common/patterns/footer }}
                                          {{ partial:common/patterns/search-modal }}
                            {{ yield:inline_script }}
                             </body>
        </html>`;
            const output = `<!DOCTYPE html>
<html lang="{{ site:short_locale }}">
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#000000" />
        {{ seo_pro:meta }}
        {{ yield:preconnect }}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        {{ webpack:style name="print.css" loading="print" }}
        {{ webpack:style name="critical.css" loading="inline" }}
        {{ webpack:style name="main.css" preload="true" }}
        {{ webpack }}
        {{ yield:page_scripts }}
    </head>
    <body>
        {{ test that="{2 - 3 + 3}" }}
        {{ partial:common/patterns/skip-link }}
        {{ partial:common/patterns/page-transition }}
        {{ partial:common/patterns/navbar }}
        <main>{{ template_content }}</main>
        {{ partial:common/patterns/social }}
        {{ partial:common/patterns/footer }}
        {{ partial:common/patterns/search-modal }}
        {{ yield:inline_script }}
    </body>
</html>`;
        assert.strictEqual(
            formatStringWithPrettier(input).trim(),
            output
        );
    });
});