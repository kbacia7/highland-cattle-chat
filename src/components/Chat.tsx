import { component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <div class="p-5 overflow-y-auto h-full">
      {[
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque egestas leo orci, tempor semper mi convallis eget. Aliquam lacinia, est sit amet venenatis elementum,",
        "ex magna faucibus massa, quis maximus sem lacus vel neque. Nunc non leo massa. Phasellus hendrerit lacus odio, non venenatis nunc iaculis in. Cras vel posuere tortor. Morbi id mollis eros. Aliquam erat volutpat. Nullam dapibus dui tristique lectus hendrerit, ac venenatis nisi dapibus. Quisque semper ligula nec lorem dictum, ut aliquet neque lobortis.",
        "Aenean sed elit ornare, porta metus nec, rutrum turpis. Fusce eleifend lorem eu nunc accumsan, a cursus libero fringilla. Quisque sodales volutpat sem, eg",
        "Nam tempus consectetur arcu et elementum. Donec sit amet nibh ullamcorper, laoreet dui id, cursus torto",
        "Suspendisse ullamcorper justo tellus, sit amet vestibulum odio rhoncus laoreet",
        "Aenean sed elit ornare, porta metus nec, rutrum turpis. Fusce eleifend lorem eu nunc accumsan, a cursus libero fringilla",
        "tempus consectetur arcu et elementum. Donec sit amet nibh ullamcorper, laoreet dui id, cursus torto",
        "Suspendisse ullamcorper",
        "justo tellus, sit amet vestibulum odio rhoncus laoreet",
        "Ut eu gravida arcu, lacinia dapibus augue. Aliquam erat volutpat. Mauris vel nisi a ante posuere pulvinar quis at magna. Donec porta enim ac quam dignissim, eget venenatis nunc bibendum. Nam dapibus diam faucibus euismod varius. Praesent at accumsan nulla, cursus tempus urna. Sed faucibus felis mi, eget tincidunt odio lobortis ut",
        "Praesent mattis sollicitudin elit, ac viverra nibh imperdiet cursus. Curabitur facilisis odio velit, et gravida metus molestie at. Nam non cursus nisi, eget pretium urna",
        "Suspendisse pharetra dolor mi, sed porta leo condimentum ac. Aenean varius sit amet nisl a maximus.",
        "Praesent mattis sollicitudin elit, ac viverra nibh imperdiet cursus. Curabitur facilisis odio velit, et gravida metus molestie at. Nam non cursus nisi, eget pretium urna",
        "tempus consectetur arcu et elementum. Donec sit amet nibh ullamcorper, laoreet dui id, cursus torto",
        "Aenean sed elit ornare, porta metus nec, rutrum turpis. Fusce eleifend lorem eu nunc accumsan, a cursus libero fringilla. Quisque sodales volutpat sem, eg",
      ].map((t) => {
        return (
          <div class="mb-3 flex items-center" key={t}>
            <div class="inline-block">
              <img
                class="rounded-full object-cover aspect-square inline"
                width="50"
                height="50"
                src="/hedgehog.jpg"
              />
            </div>
            <div class="ml-2 p-3 pl-3 w-1/3 bg-slate-300 rounded-lg inline-block">
              <p>{t}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
});
