import {html} from './main.js';

describe('tag html', () => {
  test('preserva as partes fixas e interpola valores comuns', () => {
    /*@case 09.09.preserva-as-partes-fixas-e-i-9fa4f92e*/expect(html`<p>${'Ana'}</p>`).toBe('<p>Ana</p>');
    /*@case 09.09.preserva-as-partes-fixas-e-i-0c68bbd8*/expect(html`${42}`).toBe('42');
  });
  test('escapa valores que parecem marcação', () => {
    /*@case 09.09.escapa-valores-que-parecem-m-0ebd8d13*/expect(html`${'<script>'}`).toBe('&lt;script&gt;');
  });
  test('escapa e comercial e aspas', () => {
    /*@case 09.09.escapa-e-comercial-e-aspas-7865a710*/expect(html`${'a & "b" \'c\''}`).toBe('a &amp; &quot;b&quot; &#39;c&#39;');
  });
});
