type Props = {
    from: string;
    to: string;
    onChange: (from: string, to: string) => void;
};

export function DateRangePicker({
    from, to, onChange
}: Props) {
    function handlerFromChange(value: string) {
        onChange(value, to);
    }

    function handleToChange(value: string) {
        onChange(from, value);
    }

    return (
        <div>
            <label>
                From:
                <input type="datetime-local"
                    value={from}
                    onChange={(e) => handlerFromChange(e.target.value)}
                />
            </label>

            <label>
                To:
                <input type="datetime-local"
                    value={to}
                    onChange={(e) => handleToChange(e.target.value)}
                />
            </label>
        </div>
    )
}