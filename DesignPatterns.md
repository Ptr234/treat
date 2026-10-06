# The 23 Gang of Four Design Patterns — C# Reference

The Gang of Four (Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides) organized 23 patterns into three families based on what they do:

- **Creational (5)** — how objects get created
- **Structural (7)** — how objects and classes are composed into larger structures
- **Behavioral (11)** — how objects communicate and distribute responsibility

For each pattern: the problem it solves, its structure, a worked C# example, and when to reach for it (and when not to).

---

## CREATIONAL PATTERNS

### 1. Singleton

**Problem:** You need exactly one instance of a class across the whole application — a configuration manager, a logger, a connection pool — and you need a single global point of access to it.

**Structure:** A private constructor prevents outside instantiation. A static field holds the one instance. A static accessor creates it on first use (or eagerly) and returns it thereafter.

```csharp
public sealed class ConfigurationManager
{
    private static readonly Lazy<ConfigurationManager> _instance =
        new Lazy<ConfigurationManager>(() => new ConfigurationManager());

    public static ConfigurationManager Instance => _instance.Value;

    private readonly Dictionary<string, string> _settings = new();

    private ConfigurationManager()
    {
        // Expensive setup: read from disk, env vars, etc.
        _settings["Environment"] = "Production";
    }

    public string Get(string key) => _settings.TryGetValue(key, out var v) ? v : null;
}

// Usage
var env = ConfigurationManager.Instance.Get("Environment");
```

Using `Lazy<T>` gives you thread-safe lazy initialization without hand-rolled double-checked locking.

**When to use:** Truly single, shared resources (logging, caching, app-wide config).
**When to avoid:** It's globally mutable state in disguise, which makes unit testing hard (you can't easily substitute a fake). Prefer dependency injection with a singleton *lifetime* registered in a DI container instead of a hard-coded static singleton class — you get the "one instance" guarantee without the global-access coupling.

---

### 2. Factory Method

**Problem:** A class needs to create objects, but it shouldn't need to know the concrete type it's creating — subclasses (or configuration) should decide.

**Structure:** A creator class declares a factory method returning an abstract product. Subclasses override that method to produce a specific concrete product.

```csharp
public abstract class Notification
{
    public abstract string Render();
}

public class EmailNotification : Notification
{
    public override string Render() => "Email: <html>...</html>";
}

public class SmsNotification : Notification
{
    public override string Render() => "SMS: 160 chars max";
}

public abstract class NotificationCreator
{
    // The factory method
    public abstract Notification CreateNotification();

    public string Send()
    {
        var notification = CreateNotification();
        return notification.Render();
    }
}

public class EmailNotificationCreator : NotificationCreator
{
    public override Notification CreateNotification() => new EmailNotification();
}

public class SmsNotificationCreator : NotificationCreator
{
    public override Notification CreateNotification() => new SmsNotification();
}

// Usage
NotificationCreator creator = new EmailNotificationCreator();
Console.WriteLine(creator.Send());
```

**When to use:** When a class can't anticipate the class of objects it must create, or wants subclasses to specify it.
**When to avoid:** If you only have one product type and no foreseeable variation, this is unnecessary ceremony — a plain constructor or a static helper method is fine.

---

### 3. Abstract Factory

**Problem:** You need to create *families* of related objects (e.g., UI controls for Windows vs. macOS) and guarantee that the objects produced together are compatible with each other.

**Structure:** An abstract factory interface declares creation methods for each product in the family. Concrete factories implement it, one per family/variant.

```csharp
public interface IButton { string Render(); }
public interface ICheckbox { string Render(); }

public class WindowsButton : IButton { public string Render() => "[Windows Button]"; }
public class WindowsCheckbox : ICheckbox { public string Render() => "[Windows Checkbox]"; }

public class MacButton : IButton { public string Render() => "(Mac Button)"; }
public class MacCheckbox : ICheckbox { public string Render() => "(Mac Checkbox)"; }

public interface IUiFactory
{
    IButton CreateButton();
    ICheckbox CreateCheckbox();
}

public class WindowsUiFactory : IUiFactory
{
    public IButton CreateButton() => new WindowsButton();
    public ICheckbox CreateCheckbox() => new WindowsCheckbox();
}

public class MacUiFactory : IUiFactory
{
    public IButton CreateButton() => new MacButton();
    public ICheckbox CreateCheckbox() => new MacCheckbox();
}

// Usage: the client only depends on the abstract factory interface
public class Application
{
    private readonly IButton _button;
    private readonly ICheckbox _checkbox;

    public Application(IUiFactory factory)
    {
        _button = factory.CreateButton();
        _checkbox = factory.CreateCheckbox();
    }

    public void Render() =>
        Console.WriteLine($"{_button.Render()} {_checkbox.Render()}");
}

var app = new Application(OperatingSystem.IsMacOS() ? new MacUiFactory() : new WindowsUiFactory());
app.Render();
```

**When to use:** Cross-platform UI kits, database-provider abstractions, theming systems — anywhere "families" of objects must stay consistent with each other.
**When to avoid:** If there's only ever one family, or products don't need to vary together, plain Factory Method is simpler.

---

### 4. Builder

**Problem:** Constructing a complex object step-by-step (many optional parameters, several construction stages) leads to telescoping constructors or huge parameter lists.

**Structure:** A builder object exposes step methods and returns itself (fluent chaining), plus a final `Build()` that assembles the finished product. A director is optional — it's only needed if you want to encapsulate a specific build *sequence* for reuse.

```csharp
public class Invoice
{
    public string ClientName { get; set; }
    public List<string> LineItems { get; } = new();
    public string Currency { get; set; } = "USD";
    public decimal TaxRate { get; set; }

    public override string ToString() =>
        $"{ClientName} ({Currency}) — {LineItems.Count} items, tax {TaxRate:P0}";
}

public class InvoiceBuilder
{
    private readonly Invoice _invoice = new();

    public InvoiceBuilder ForClient(string name)
    {
        _invoice.ClientName = name;
        return this;
    }

    public InvoiceBuilder WithCurrency(string currency)
    {
        _invoice.Currency = currency;
        return this;
    }

    public InvoiceBuilder AddLineItem(string item)
    {
        _invoice.LineItems.Add(item);
        return this;
    }

    public InvoiceBuilder WithTax(decimal rate)
    {
        _invoice.TaxRate = rate;
        return this;
    }

    public Invoice Build() => _invoice;
}

// Usage
var invoice = new InvoiceBuilder()
    .ForClient("Tilenga Safaris")
    .WithCurrency("USD")
    .AddLineItem("Website retainer — August")
    .AddLineItem("Domain renewal")
    .WithTax(0.18m)
    .Build();
```

**When to use:** Objects with many optional fields, multi-step construction, or where you want immutable final objects assembled piece by piece.
**When to avoid:** Simple objects with a handful of required fields — a constructor or object initializer is clearer.

---

### 5. Prototype

**Problem:** Creating a new object from scratch is expensive or complex, but you already have a similar object you could copy and tweak instead.

**Structure:** Objects implement a `Clone()` method that returns a copy of themselves (shallow or deep, as needed), rather than the client using `new` and rebuilding state.

```csharp
public class DocumentTemplate : ICloneable
{
    public string Title { get; set; }
    public List<string> Sections { get; set; } = new();

    public object Clone()
    {
        // Deep copy the mutable list so clones don't share state
        return new DocumentTemplate
        {
            Title = Title,
            Sections = new List<string>(Sections)
        };
    }
}

// Usage
var baseContract = new DocumentTemplate
{
    Title = "Standard Service Agreement",
    Sections = { "Scope", "Payment Terms", "Termination" }
};

var retainerContract = (DocumentTemplate)baseContract.Clone();
retainerContract.Title = "Retainer Service Agreement";
retainerContract.Sections.Add("Monthly Deliverables");
// baseContract is untouched
```

**When to use:** When object creation is costlier than copying (expensive DB lookups, network calls during construction), or when you need many variations of a "base" configured object.
**When to avoid:** Deep-copy semantics can get subtle with nested references/circular graphs — if your object graph is complex, a dedicated copy-constructor or serialization-based clone might be safer than a hand-rolled `Clone()`.

---

## STRUCTURAL PATTERNS

### 6. Adapter

**Problem:** You have an existing class with an incompatible interface, and you want to use it where a different interface is expected — without modifying the original class.

**Structure:** An adapter class implements the target interface and internally delegates calls to the adaptee, translating the request.

```csharp
// The interface your app expects
public interface IPaymentProcessor
{
    bool Charge(decimal amount, string currency);
}

// A third-party library you can't modify, with a different shape
public class LegacyStripeGateway
{
    public string MakePayment(int amountInCents, string currencyCode)
    {
        return amountInCents > 0 ? "SUCCESS" : "FAILED";
    }
}

// The adapter bridges the gap
public class StripeAdapter : IPaymentProcessor
{
    private readonly LegacyStripeGateway _gateway;

    public StripeAdapter(LegacyStripeGateway gateway) => _gateway = gateway;

    public bool Charge(decimal amount, string currency)
    {
        int cents = (int)(amount * 100);
        return _gateway.MakePayment(cents, currency) == "SUCCESS";
    }
}

// Usage — client code only knows IPaymentProcessor
IPaymentProcessor processor = new StripeAdapter(new LegacyStripeGateway());
processor.Charge(49.99m, "USD");
```

**When to use:** Integrating third-party or legacy code without touching it.
**When to avoid:** If you control both sides, just change one of the interfaces to match — an adapter is a workaround, not a design goal.

---

### 7. Bridge

**Problem:** You have an abstraction (e.g., "shape") and an implementation (e.g., "rendering API") that both vary independently, and inheritance would force you into a combinatorial explosion of subclasses (WindowsCircle, MacCircle, WindowsSquare, MacSquare...).

**Structure:** Split into two hierarchies — an abstraction that holds a reference to an implementer interface, and separate concrete implementers. Either side can be extended without touching the other.

```csharp
// Implementer hierarchy — "how to render"
public interface IRenderer
{
    string RenderCircle(float radius);
}

public class VectorRenderer : IRenderer
{
    public string RenderCircle(float radius) => $"Drawing vector circle r={radius}";
}

public class RasterRenderer : IRenderer
{
    public string RenderCircle(float radius) => $"Drawing pixelated circle r={radius}";
}

// Abstraction hierarchy — "what to render"
public abstract class Shape
{
    protected IRenderer Renderer;
    protected Shape(IRenderer renderer) => Renderer = renderer;
    public abstract string Draw();
}

public class Circle : Shape
{
    private float _radius;
    public Circle(IRenderer renderer, float radius) : base(renderer) => _radius = radius;
    public override string Draw() => Renderer.RenderCircle(_radius);
}

// Usage — any shape with any renderer, no combinatorial subclassing
var circle1 = new Circle(new VectorRenderer(), 5);
var circle2 = new Circle(new RasterRenderer(), 5);
```

**When to use:** Two independent dimensions of variation (device drivers, GUI toolkits, persistence backends).
**When to avoid:** If there's really only one dimension of variation, plain inheritance or Strategy is simpler.

---

### 8. Composite

**Problem:** You need to treat individual objects and groups of objects uniformly — e.g., a file and a folder full of files should both respond to "get size" the same way.

**Structure:** A common component interface is implemented by both leaf nodes and composite nodes; composites hold children and delegate/aggregate operations across them.

```csharp
public interface IFileSystemItem
{
    string Name { get; }
    long GetSize();
}

public class FileItem : IFileSystemItem
{
    public string Name { get; }
    private readonly long _size;

    public FileItem(string name, long size) { Name = name; _size = size; }
    public long GetSize() => _size;
}

public class FolderItem : IFileSystemItem
{
    public string Name { get; }
    private readonly List<IFileSystemItem> _children = new();

    public FolderItem(string name) => Name = name;

    public void Add(IFileSystemItem item) => _children.Add(item);

    public long GetSize() => _children.Sum(c => c.GetSize());
}

// Usage
var root = new FolderItem("project");
root.Add(new FileItem("readme.md", 1200));

var src = new FolderItem("src");
src.Add(new FileItem("main.cs", 4300));
src.Add(new FileItem("utils.cs", 2100));

root.Add(src);

Console.WriteLine(root.GetSize()); // sums recursively through the whole tree
```

**When to use:** Tree structures — file systems, UI component hierarchies, org charts, menu systems.
**When to avoid:** If the "whole-part" hierarchy is only one level deep and never nests, a simple collection is enough.

---

### 9. Decorator

**Problem:** You want to add responsibilities to an individual object dynamically, without affecting other instances of the same class and without a rigid subclass for every combination of features.

**Structure:** Decorators implement the same interface as the component they wrap, hold a reference to a wrapped instance, and add behavior before/after delegating to it. Decorators can be stacked.

```csharp
public interface ICoffee
{
    decimal Cost { get; }
    string Description { get; }
}

public class PlainCoffee : ICoffee
{
    public decimal Cost => 2.50m;
    public string Description => "Coffee";
}

public abstract class CoffeeDecorator : ICoffee
{
    protected readonly ICoffee Inner;
    protected CoffeeDecorator(ICoffee inner) => Inner = inner;

    public abstract decimal Cost { get; }
    public abstract string Description { get; }
}

public class MilkDecorator : CoffeeDecorator
{
    public MilkDecorator(ICoffee inner) : base(inner) { }
    public override decimal Cost => Inner.Cost + 0.50m;
    public override string Description => Inner.Description + " + Milk";
}

public class CaramelDecorator : CoffeeDecorator
{
    public CaramelDecorator(ICoffee inner) : base(inner) { }
    public override decimal Cost => Inner.Cost + 0.75m;
    public override string Description => Inner.Description + " + Caramel";
}

// Usage — stack decorators freely, at runtime
ICoffee order = new CaramelDecorator(new MilkDecorator(new PlainCoffee()));
Console.WriteLine($"{order.Description}: ${order.Cost}");
// "Coffee + Milk + Caramel: $3.75"
```

**When to use:** Optional add-on behaviors (middleware pipelines, stream wrappers like `GZipStream` around a `FileStream`, UI widget borders/scrollbars).
**When to avoid:** If the combination space is small and fixed, subclassing directly is simpler to read.

---

### 10. Facade

**Problem:** A subsystem has many moving parts with a complex interface, and most client code just wants a simple, high-level operation.

**Structure:** A facade class provides a simplified method (or small set of methods) that internally coordinates the subsystem's classes.

```csharp
// Complex subsystem
public class VideoDecoder { public string Decode(string file) => $"decoded({file})"; }
public class AudioMixer { public string Mix(string audio) => $"mixed({audio})"; }
public class SubtitleRenderer { public string Render(string subs) => $"subtitled({subs})"; }
public class OutputEncoder { public string Encode(string v, string a, string s) => $"{v}+{a}+{s} -> final.mp4"; }

// Facade
public class VideoConverterFacade
{
    private readonly VideoDecoder _decoder = new();
    private readonly AudioMixer _mixer = new();
    private readonly SubtitleRenderer _subtitles = new();
    private readonly OutputEncoder _encoder = new();

    public string ConvertToMp4(string videoFile, string audioFile, string subtitleFile)
    {
        var video = _decoder.Decode(videoFile);
        var audio = _mixer.Mix(audioFile);
        var subs = _subtitles.Render(subtitleFile);
        return _encoder.Encode(video, audio, subs);
    }
}

// Usage — the caller doesn't need to know about 4 subsystem classes
var converter = new VideoConverterFacade();
var result = converter.ConvertToMp4("sermon.raw", "sermon.wav", "sermon.srt");
```

**When to use:** Wrapping a complex library or subsystem to give the rest of the app a clean, minimal entry point.
**When to avoid:** Don't let a facade become a "god object" that hides so much it becomes the only way anything gets done — keep the subsystem classes accessible for cases that need finer control.

---

### 11. Flyweight

**Problem:** You need huge numbers of similar objects (characters in a text editor, trees in a forest render, particles) and storing full state per object would exhaust memory.

**Structure:** Split object state into **intrinsic** (shared, immutable, stored once) and **extrinsic** (unique per use, passed in at the point of use). A factory ensures intrinsic-state objects are shared, not duplicated.

```csharp
// Intrinsic state — shared and reused
public class TreeType
{
    public string Name { get; }
    public string Texture { get; }
    public string Color { get; }

    public TreeType(string name, string texture, string color)
    {
        Name = name; Texture = texture; Color = color;
    }

    public string Render(int x, int y) => $"{Name} at ({x},{y}) [{Color}, {Texture}]";
}

public class TreeTypeFactory
{
    private static readonly Dictionary<string, TreeType> _cache = new();

    public static TreeType Get(string name, string texture, string color)
    {
        var key = $"{name}-{texture}-{color}";
        if (!_cache.TryGetValue(key, out var type))
        {
            type = new TreeType(name, texture, color);
            _cache[key] = type; // one shared instance per unique combination
        }
        return type;
    }
}

// Extrinsic state — position, held by the lightweight "Tree" instance
public class Tree
{
    private readonly int _x, _y;
    private readonly TreeType _type;

    public Tree(int x, int y, TreeType type) { _x = x; _y = y; _type = type; }

    public string Render() => _type.Render(_x, _y);
}

// Usage — a million trees, but only a handful of TreeType objects in memory
var forest = new List<Tree>();
for (int i = 0; i < 1_000_000; i++)
{
    var type = TreeTypeFactory.Get("Oak", "bark_01", "green");
    forest.Add(new Tree(i % 1000, i / 1000, type));
}
```

**When to use:** Very large numbers of fine-grained objects where most of their state can be shared.
**When to avoid:** If object counts are modest, the extra indirection isn't worth it — profile before reaching for this.

---

### 12. Proxy

**Problem:** You want to control access to an object — lazily create it, check permissions, log calls, or cache results — without changing the client's interaction with it.

**Structure:** A proxy implements the same interface as the real subject and controls access to it, adding behavior around delegation.

```csharp
public interface IImage
{
    string Display();
}

public class HighResImage : IImage
{
    private readonly string _file;

    public HighResImage(string file)
    {
        _file = file;
        LoadFromDisk(); // expensive!
    }

    private void LoadFromDisk() => Console.WriteLine($"Loading {_file} from disk...");

    public string Display() => $"Displaying {_file}";
}

// Virtual proxy — defers expensive creation until actually needed
public class ImageProxy : IImage
{
    private readonly string _file;
    private HighResImage _realImage;

    public ImageProxy(string file) => _file = file;

    public string Display()
    {
        _realImage ??= new HighResImage(_file); // lazy load on first use
        return _realImage.Display();
    }
}

// Usage
IImage image = new ImageProxy("sermon_thumbnail.png");
// Nothing loaded yet
Console.WriteLine(image.Display()); // loads now, on demand
```

**When to use:** Lazy initialization, access control, remote object stubs, caching, logging wrappers — anywhere you want to intercept calls to a real object transparently.
**When to avoid:** If you don't need the interception behavior, it's an unnecessary layer of indirection.

---

## BEHAVIORAL PATTERNS

### 13. Chain of Responsibility

**Problem:** A request could be handled by one of several possible handlers, and you don't want the sender coupled to which one handles it.

**Structure:** Handlers are linked in a chain; each either handles the request or passes it to the next handler in line.

```csharp
public abstract class SupportHandler
{
    protected SupportHandler Next;

    public SupportHandler SetNext(SupportHandler next)
    {
        Next = next;
        return next;
    }

    public abstract string Handle(int severity);
}

public class Tier1Support : SupportHandler
{
    public override string Handle(int severity) =>
        severity <= 2 ? "Tier 1 resolved it" : Next?.Handle(severity) ?? "Unhandled";
}

public class Tier2Support : SupportHandler
{
    public override string Handle(int severity) =>
        severity <= 5 ? "Tier 2 resolved it" : Next?.Handle(severity) ?? "Unhandled";
}

public class Tier3Support : SupportHandler
{
    public override string Handle(int severity) => "Tier 3 (engineering) resolved it";
}

// Usage
var tier1 = new Tier1Support();
var tier2 = new Tier2Support();
var tier3 = new Tier3Support();
tier1.SetNext(tier2).SetNext(tier3);

Console.WriteLine(tier1.Handle(7)); // "Tier 3 (engineering) resolved it"
```

**When to use:** Middleware pipelines, event bubbling, approval workflows, logging levels.
**When to avoid:** If exactly one handler should always apply and it's known in advance, direct dispatch is clearer.

---

### 14. Command

**Problem:** You want to turn a request into a standalone object, so it can be queued, logged, undone, or parameterized independently of who invoked it.

**Structure:** A command interface declares `Execute()` (and often `Undo()`). Concrete commands wrap a receiver and the parameters needed to act on it. An invoker holds and triggers commands without knowing their details.

```csharp
public interface ICommand
{
    void Execute();
    void Undo();
}

public class TextDocument
{
    public StringBuilder Content { get; } = new();
}

public class InsertTextCommand : ICommand
{
    private readonly TextDocument _doc;
    private readonly string _text;

    public InsertTextCommand(TextDocument doc, string text)
    {
        _doc = doc;
        _text = text;
    }

    public void Execute() => _doc.Content.Append(_text);
    public void Undo() => _doc.Content.Length -= _text.Length;
}

public class CommandInvoker
{
    private readonly Stack<ICommand> _history = new();

    public void Execute(ICommand command)
    {
        command.Execute();
        _history.Push(command);
    }

    public void UndoLast()
    {
        if (_history.Count > 0) _history.Pop().Undo();
    }
}

// Usage
var doc = new TextDocument();
var invoker = new CommandInvoker();

invoker.Execute(new InsertTextCommand(doc, "Hello, "));
invoker.Execute(new InsertTextCommand(doc, "world!"));
Console.WriteLine(doc.Content); // "Hello, world!"

invoker.UndoLast();
Console.WriteLine(doc.Content); // "Hello, "
```

**When to use:** Undo/redo stacks, task queues, macro recording, GUI button actions decoupled from their handlers.
**When to avoid:** For simple, one-off actions with no need for queuing/undo/logging, a direct method call is enough.

---

### 15. Interpreter

**Problem:** You have a simple language or grammar (rules, filters, query expressions) that needs to be evaluated repeatedly, and you want each grammar rule represented as a class.

**Structure:** An abstract expression declares `Interpret()`. Terminal expressions represent grammar leaves; non-terminal expressions compose other expressions (and/or/not, etc.).

```csharp
public interface IExpression
{
    bool Interpret(Dictionary<string, bool> context);
}

public class VariableExpression : IExpression
{
    private readonly string _name;
    public VariableExpression(string name) => _name = name;
    public bool Interpret(Dictionary<string, bool> context) => context[_name];
}

public class AndExpression : IExpression
{
    private readonly IExpression _left, _right;
    public AndExpression(IExpression left, IExpression right) { _left = left; _right = right; }
    public bool Interpret(Dictionary<string, bool> context) =>
        _left.Interpret(context) && _right.Interpret(context);
}

public class OrExpression : IExpression
{
    private readonly IExpression _left, _right;
    public OrExpression(IExpression left, IExpression right) { _left = left; _right = right; }
    public bool Interpret(Dictionary<string, bool> context) =>
        _left.Interpret(context) || _right.Interpret(context);
}

// Usage — build and evaluate: "isPremium AND (isActive OR isTrial)"
IExpression rule = new AndExpression(
    new VariableExpression("isPremium"),
    new OrExpression(
        new VariableExpression("isActive"),
        new VariableExpression("isTrial")));

var context = new Dictionary<string, bool>
{
    ["isPremium"] = true,
    ["isActive"] = false,
    ["isTrial"] = true
};

Console.WriteLine(rule.Interpret(context)); // true
```

**When to use:** Small domain-specific languages — rule engines, search query parsers, configuration expressions.
**When to avoid:** For anything beyond a small grammar, this pattern gets unwieldy fast — use an existing parser generator or expression library instead (this is the least commonly used GoF pattern in modern practice).

---

### 16. Iterator

**Problem:** You want to traverse a collection's elements without exposing its underlying representation (array, linked list, tree).

**Structure:** An iterator interface declares `MoveNext()`/`Current` (or, in C#, you typically implement `IEnumerable<T>`/`IEnumerator<T>` and get `foreach` support for free).

```csharp
public class TaskList : IEnumerable<string>
{
    private readonly List<string> _tasks = new();

    public void Add(string task) => _tasks.Add(task);

    // Custom iterator — e.g., only iterate incomplete tasks
    public IEnumerator<string> GetEnumerator()
    {
        foreach (var task in _tasks)
        {
            if (!task.StartsWith("[done]"))
                yield return task;
        }
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}

// Usage
var tasks = new TaskList();
tasks.Add("Draft invoice for Women In Design");
tasks.Add("[done] Deploy TruCaller backend");
tasks.Add("Edit sermon clips");

foreach (var task in tasks) // custom iteration logic runs transparently
{
    Console.WriteLine(task);
}
```

C#'s `yield return` and the built-in `IEnumerable<T>`/`foreach` machinery *is* the Iterator pattern — it's baked into the language rather than something you typically hand-roll.

**When to use:** Custom traversal orders, filtering during iteration, or exposing a collection without exposing its internal structure.
**When to avoid:** For plain collections, just use built-in `IEnumerable<T>` / LINQ — no custom iterator needed.

---

### 17. Mediator

**Problem:** Many objects need to communicate with each other, but direct references between all of them create a tangled web of dependencies.

**Structure:** A mediator object centralizes communication; colleague objects talk to the mediator instead of each other.

```csharp
public interface IChatMediator
{
    void SendMessage(string message, User sender);
    void Register(User user);
}

public class ChatRoomMediator : IChatMediator
{
    private readonly List<User> _users = new();

    public void Register(User user) => _users.Add(user);

    public void SendMessage(string message, User sender)
    {
        foreach (var user in _users)
        {
            if (user != sender)
                user.Receive(message, sender.Name);
        }
    }
}

public class User
{
    public string Name { get; }
    private readonly IChatMediator _mediator;

    public User(string name, IChatMediator mediator)
    {
        Name = name;
        _mediator = mediator;
        _mediator.Register(this);
    }

    public void Send(string message) => _mediator.SendMessage(message, this);

    public void Receive(string message, string from) =>
        Console.WriteLine($"{Name} received from {from}: {message}");
}

// Usage — users never reference each other directly
var room = new ChatRoomMediator();
var alice = new User("Alice", room);
var bob = new User("Bob", room);

alice.Send("Hey Bob!"); // Bob receives it; Alice never touched Bob directly
```

**When to use:** Complex many-to-many object interactions — chat rooms, UI dialogs where widgets affect each other, air-traffic-control-style coordination.
**When to avoid:** If interactions are simple and few, a mediator adds a layer of indirection you don't need. Also watch out: the mediator itself can become a "god object" if it grows unchecked.

---

### 18. Memento

**Problem:** You want to capture and externally store an object's internal state so it can be restored later, without violating its encapsulation.

**Structure:** The originator creates a memento snapshot of itself. A caretaker stores mementos (often in a stack for undo) without inspecting or modifying their contents. Only the originator can extract state back out of a memento.

```csharp
public class EditorMemento
{
    public string Content { get; }
    internal EditorMemento(string content) => Content = content;
}

public class Editor
{
    public string Content { get; set; } = "";

    public EditorMemento Save() => new EditorMemento(Content);

    public void Restore(EditorMemento memento) => Content = memento.Content;
}

public class EditorHistory
{
    private readonly Stack<EditorMemento> _history = new();

    public void Backup(Editor editor) => _history.Push(editor.Save());

    public void Undo(Editor editor)
    {
        if (_history.Count > 0)
            editor.Restore(_history.Pop());
    }
}

// Usage
var editor = new Editor();
var history = new EditorHistory();

editor.Content = "Draft v1";
history.Backup(editor);

editor.Content = "Draft v2 — heavily revised";
history.Backup(editor);

editor.Content = "Draft v3 — oops, broke it";

history.Undo(editor);
Console.WriteLine(editor.Content); // "Draft v2 — heavily revised"
```

**When to use:** Undo/redo, checkpoints, transaction rollback for in-memory state.
**When to avoid:** If state is huge, storing full snapshots repeatedly can be memory-heavy — consider storing diffs instead, or use Command's undo approach if reversible operations are cheaper than snapshots.

---

### 19. Observer

**Problem:** When one object's state changes, an open-ended number of other objects need to be notified and updated automatically, without the subject being tightly coupled to its observers.

**Structure:** A subject maintains a list of observers and notifies them all (typically via a common `Update()` method, or in C# via events) whenever relevant state changes.

```csharp
public class StockTicker
{
    private decimal _price;

    // Idiomatic C# uses events rather than a hand-rolled observer list
    public event EventHandler<decimal> PriceChanged;

    public decimal Price
    {
        get => _price;
        set
        {
            _price = value;
            PriceChanged?.Invoke(this, value);
        }
    }
}

public class PriceDisplay
{
    public void Subscribe(StockTicker ticker) => ticker.PriceChanged += OnPriceChanged;

    private void OnPriceChanged(object sender, decimal newPrice) =>
        Console.WriteLine($"Display updated: ${newPrice}");
}

public class PriceAlert
{
    private readonly decimal _threshold;
    public PriceAlert(decimal threshold) => _threshold = threshold;

    public void Subscribe(StockTicker ticker) => ticker.PriceChanged += OnPriceChanged;

    private void OnPriceChanged(object sender, decimal newPrice)
    {
        if (newPrice > _threshold)
            Console.WriteLine($"ALERT: price crossed ${_threshold}!");
    }
}

// Usage
var ticker = new StockTicker();
new PriceDisplay().Subscribe(ticker);
new PriceAlert(threshold: 100).Subscribe(ticker);

ticker.Price = 105; // both subscribers react independently
```

**When to use:** Event-driven UIs, pub/sub systems, model-view synchronization — anywhere a "one-to-many" reactive relationship exists. In C#, `event`/`EventHandler` is the idiomatic implementation of this pattern.
**When to avoid:** Watch for memory leaks — subscribers that never unsubscribe keep the subject alive, and vice versa. Use weak event patterns or explicit unsubscription for long-lived subjects.

---

### 20. State

**Problem:** An object's behavior needs to change based on its internal state, and you want to avoid a giant conditional (`if`/`switch`) sprinkled across every method that checks "what state am I in."

**Structure:** A context holds a reference to a current state object. Each concrete state implements the state interface and can trigger a transition to another state.

```csharp
public interface IOrderState
{
    void Next(OrderContext context);
    string Name { get; }
}

public class PendingState : IOrderState
{
    public string Name => "Pending";
    public void Next(OrderContext context) => context.SetState(new ShippedState());
}

public class ShippedState : IOrderState
{
    public string Name => "Shipped";
    public void Next(OrderContext context) => context.SetState(new DeliveredState());
}

public class DeliveredState : IOrderState
{
    public string Name => "Delivered";
    public void Next(OrderContext context) =>
        Console.WriteLine("Already delivered — no further transitions.");
}

public class OrderContext
{
    private IOrderState _state = new PendingState();

    public void SetState(IOrderState state) => _state = state;
    public string CurrentState => _state.Name;
    public void Advance() => _state.Next(this);
}

// Usage
var order = new OrderContext();
Console.WriteLine(order.CurrentState); // Pending
order.Advance();
Console.WriteLine(order.CurrentState); // Shipped
order.Advance();
Console.WriteLine(order.CurrentState); // Delivered
```

**When to use:** Order/workflow status machines, connection state (connecting/connected/disconnected), game character states.
**When to avoid:** For a couple of simple states with no real behavioral differences, an enum plus a switch statement is perfectly fine and more lightweight.

---

### 21. Strategy

**Problem:** You have several interchangeable algorithms for the same task (different sorting approaches, different pricing rules, different validation logic) and want to switch between them at runtime without conditional branching scattered through your code.

**Structure:** A strategy interface declares the algorithm's method. Concrete strategies implement it. A context holds a reference to a strategy and delegates to it.

```csharp
public interface IPricingStrategy
{
    decimal CalculatePrice(decimal basePrice);
}

public class RegularPricing : IPricingStrategy
{
    public decimal CalculatePrice(decimal basePrice) => basePrice;
}

public class RetainerClientPricing : IPricingStrategy
{
    public decimal CalculatePrice(decimal basePrice) => basePrice * 0.85m; // 15% discount
}

public class RushJobPricing : IPricingStrategy
{
    public decimal CalculatePrice(decimal basePrice) => basePrice * 1.30m; // 30% rush surcharge
}

public class InvoiceLine
{
    private readonly IPricingStrategy _strategy;
    private readonly decimal _basePrice;

    public InvoiceLine(decimal basePrice, IPricingStrategy strategy)
    {
        _basePrice = basePrice;
        _strategy = strategy;
    }

    public decimal FinalPrice() => _strategy.CalculatePrice(_basePrice);
}

// Usage — swap strategy without touching InvoiceLine's logic
var line1 = new InvoiceLine(500m, new RetainerClientPricing());
var line2 = new InvoiceLine(500m, new RushJobPricing());

Console.WriteLine(line1.FinalPrice()); // 425
Console.WriteLine(line2.FinalPrice()); // 650
```

**When to use:** Interchangeable algorithms/policies chosen at runtime — pricing rules, sorting/comparison logic, validation rules, compression algorithms.
**When to avoid:** If there's genuinely only one algorithm and no foreseeable variation, don't introduce the interface prematurely.

---

### 22. Template Method

**Problem:** Several classes follow the same overall algorithm/steps, but one or two steps differ between them. You want to define the skeleton once and let subclasses fill in only the varying parts.

**Structure:** A base class defines a (typically non-virtual/sealed) template method that calls a fixed sequence of steps, some of which are abstract or virtual "hook" methods overridden by subclasses.

```csharp
public abstract class ReportGenerator
{
    // Template method — the algorithm's skeleton, fixed for all subclasses
    public string Generate(string data)
    {
        var header = BuildHeader();
        var body = FormatBody(data);
        var footer = BuildFooter();
        return $"{header}\n{body}\n{footer}";
    }

    protected virtual string BuildHeader() => "=== Report ===";
    protected virtual string BuildFooter() => "=== End ===";

    // The one step every subclass must define differently
    protected abstract string FormatBody(string data);
}

public class PlainTextReport : ReportGenerator
{
    protected override string FormatBody(string data) => data;
}

public class MarkdownReport : ReportGenerator
{
    protected override string BuildHeader() => "# Report";
    protected override string FormatBody(string data) => $"**{data}**";
}

// Usage
ReportGenerator report = new MarkdownReport();
Console.WriteLine(report.Generate("Q3 invoice summary"));
```

**When to use:** Multiple classes sharing a fixed workflow with a few customizable steps — data import pipelines, test setup/teardown frameworks, report builders.
**When to avoid:** If subclasses need to change the *order* of steps (not just fill in individual steps), Template Method is too rigid — Strategy is more flexible there.

---

### 23. Visitor

**Problem:** You need to add new operations across a set of related classes (an object structure) without modifying those classes each time — especially useful when the operations change more often than the class hierarchy does.

**Structure:** Each element in the structure implements an `Accept(visitor)` method that calls back into the visitor with itself (`visitor.Visit(this)`, double dispatch). The visitor interface declares an overload per concrete element type; new visitors add new operations without touching the elements.

```csharp
public interface IShapeVisitor
{
    void Visit(Circle circle);
    void Visit(Rectangle rectangle);
}

public interface IShape
{
    void Accept(IShapeVisitor visitor);
}

public class Circle : IShape
{
    public float Radius { get; }
    public Circle(float radius) => Radius = radius;
    public void Accept(IShapeVisitor visitor) => visitor.Visit(this);
}

public class Rectangle : IShape
{
    public float Width { get; }
    public float Height { get; }
    public Rectangle(float w, float h) { Width = w; Height = h; }
    public void Accept(IShapeVisitor visitor) => visitor.Visit(this);
}

// A new operation, added without touching Circle/Rectangle at all
public class AreaCalculatorVisitor : IShapeVisitor
{
    public double TotalArea { get; private set; }

    public void Visit(Circle circle) => TotalArea += Math.PI * circle.Radius * circle.Radius;
    public void Visit(Rectangle rectangle) => TotalArea += rectangle.Width * rectangle.Height;
}

// Usage
var shapes = new List<IShape> { new Circle(3), new Rectangle(4, 5) };
var areaVisitor = new AreaCalculatorVisitor();

foreach (var shape in shapes)
    shape.Accept(areaVisitor);

Console.WriteLine(areaVisitor.TotalArea);
```

**When to use:** Stable class hierarchies where you frequently need to add new *operations* over them (compilers walking AST nodes, document exporters targeting different formats).
**When to avoid:** If the element hierarchy itself changes often (new shape types added regularly), Visitor is painful — every new element type forces you to update every visitor. In that case, put the behavior back on the elements themselves.

---

## Quick Reference Table

| # | Pattern | Family | Core Purpose |
|---|---------|--------|---------------|
| 1 | Singleton | Creational | Guarantee a single instance |
| 2 | Factory Method | Creational | Defer instantiation to subclasses |
| 3 | Abstract Factory | Creational | Create families of related objects |
| 4 | Builder | Creational | Construct complex objects step-by-step |
| 5 | Prototype | Creational | Clone existing objects instead of building new ones |
| 6 | Adapter | Structural | Make incompatible interfaces work together |
| 7 | Bridge | Structural | Decouple abstraction from implementation |
| 8 | Composite | Structural | Treat individual objects and groups uniformly |
| 9 | Decorator | Structural | Add responsibilities dynamically |
| 10 | Facade | Structural | Simplify a complex subsystem's interface |
| 11 | Flyweight | Structural | Share state to support huge object counts efficiently |
| 12 | Proxy | Structural | Control access to another object |
| 13 | Chain of Responsibility | Behavioral | Pass a request along a chain of handlers |
| 14 | Command | Behavioral | Encapsulate a request as an object |
| 15 | Interpreter | Behavioral | Represent and evaluate a small grammar |
| 16 | Iterator | Behavioral | Traverse a collection without exposing its structure |
| 17 | Mediator | Behavioral | Centralize communication between objects |
| 18 | Memento | Behavioral | Capture and restore object state |
| 19 | Observer | Behavioral | Notify dependents automatically on state change |
| 20 | State | Behavioral | Change behavior when internal state changes |
| 21 | Strategy | Behavioral | Swap interchangeable algorithms at runtime |
| 22 | Template Method | Behavioral | Fix an algorithm's skeleton, vary its steps |
| 23 | Visitor | Behavioral | Add new operations without changing element classes |